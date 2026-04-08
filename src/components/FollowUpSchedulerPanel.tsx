"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Timer,
  Play,
  Pause,
  Gear,
  ArrowClockwise,
  Clock,
  CheckCircle,
  ChatCircle,
  Warning,
} from "@phosphor-icons/react";

interface FollowUpTracker {
  prospectId: string;
  businessName: string;
  aiRespondedAt: string;
  prospectRepliedAt: string;
  channel: "email" | "sms";
  customDelayHours: number | null;
  autoResumed: boolean;
  autoResumedAt: string | null;
  status: "waiting" | "resumed" | "prospect_replied" | "manually_handled";
}

interface FollowUpConfig {
  defaultDelayHours: number;
  enabled: boolean;
  maxAutoResumes: number;
  sendReengagementMessage: boolean;
  reengagementTemplate: string;
}

interface SchedulerData {
  config: FollowUpConfig;
  trackers: FollowUpTracker[];
  stats: {
    totalWaiting: number;
    totalResumed: number;
    totalReplied: number;
    dueForResume: number;
    avgResponseTime: number | null;
  };
}

export default function FollowUpSchedulerPanel() {
  const [data, setData] = useState<SchedulerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [editConfig, setEditConfig] = useState<FollowUpConfig | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/followup-scheduler");
      const json = await res.json();
      setData(json);
      if (!editConfig) setEditConfig(json.config);
    } catch (err) {
      console.error("Failed to fetch scheduler data:", err);
    } finally {
      setLoading(false);
    }
  }, [editConfig]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRunCheck = async () => {
    setRunning(true);
    try {
      const res = await fetch("/api/followup-scheduler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run" }),
      });
      const result = await res.json();
      alert(result.message);
      await fetchData();
    } finally {
      setRunning(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!editConfig) return;
    setSaving(true);
    try {
      await fetch("/api/followup-scheduler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update-config", config: editConfig }),
      });
      await fetchData();
      setConfigOpen(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-border rounded w-48 mb-4" />
        <div className="h-32 bg-border rounded" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6">
        <p className="text-muted">Failed to load scheduler data.</p>
      </div>
    );
  }

  const { config, trackers, stats } = data;

  function getTimeRemaining(tracker: FollowUpTracker): string {
    const delay = tracker.customDelayHours ?? config.defaultDelayHours;
    const aiTime = new Date(tracker.aiRespondedAt).getTime();
    const deadline = aiTime + delay * 60 * 60 * 1000;
    const remaining = deadline - Date.now();
    if (remaining <= 0) return "Due now";
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Timer size={24} className="text-blue-400" />
            <div>
              <h2 className="text-lg font-bold">Follow-Up Scheduler</h2>
              <p className="text-xs text-muted">
                Auto-resumes funnels after {config.defaultDelayHours}h of no reply
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                config.enabled
                  ? "bg-green-400/10 text-green-400"
                  : "bg-red-400/10 text-red-400"
              }`}
            >
              {config.enabled ? "Active" : "Disabled"}
            </span>
            <button
              onClick={() => setConfigOpen(!configOpen)}
              className="p-2 rounded-lg hover:bg-background transition-colors"
              title="Configure"
            >
              <Gear size={18} className="text-muted" />
            </button>
            <button
              onClick={handleRunCheck}
              disabled={running}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors disabled:opacity-50"
            >
              <ArrowClockwise size={14} className={running ? "animate-spin" : ""} />
              {running ? "Running..." : "Run Check"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="text-center p-3 bg-background rounded-lg">
            <div className="text-xl font-bold text-yellow-400">{stats.totalWaiting}</div>
            <div className="text-[10px] text-muted">Waiting</div>
          </div>
          <div className="text-center p-3 bg-background rounded-lg">
            <div className="text-xl font-bold text-orange-400">{stats.dueForResume}</div>
            <div className="text-[10px] text-muted">Due for Resume</div>
          </div>
          <div className="text-center p-3 bg-background rounded-lg">
            <div className="text-xl font-bold text-green-400">{stats.totalResumed}</div>
            <div className="text-[10px] text-muted">Auto-Resumed</div>
          </div>
          <div className="text-center p-3 bg-background rounded-lg">
            <div className="text-xl font-bold text-blue-400">{stats.totalReplied}</div>
            <div className="text-[10px] text-muted">Replied Back</div>
          </div>
          <div className="text-center p-3 bg-background rounded-lg">
            <div className="text-xl font-bold">
              {stats.avgResponseTime !== null ? `${stats.avgResponseTime}h` : "—"}
            </div>
            <div className="text-[10px] text-muted">Avg Response Time</div>
          </div>
        </div>
      </div>

      {/* Config Panel */}
      {configOpen && editConfig && (
        <div className="bg-surface border border-blue-500/20 rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Gear size={16} className="text-blue-400" />
            Scheduler Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted block mb-1">
                Auto-Resume Delay (hours)
              </label>
              <input
                type="number"
                min={1}
                max={720}
                value={editConfig.defaultDelayHours}
                onChange={(e) =>
                  setEditConfig({ ...editConfig, defaultDelayHours: parseInt(e.target.value) || 48 })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
              />
              <p className="text-[10px] text-muted mt-1">
                How long to wait after AI responds before auto-resuming the funnel.
              </p>
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">
                Max Auto-Resumes per Prospect
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={editConfig.maxAutoResumes}
                onChange={(e) =>
                  setEditConfig({ ...editConfig, maxAutoResumes: parseInt(e.target.value) || 2 })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
              />
              <p className="text-[10px] text-muted mt-1">
                Stop auto-resuming after this many attempts.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editConfig.enabled}
                  onChange={(e) =>
                    setEditConfig({ ...editConfig, enabled: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="text-sm">Enable Auto-Resume</span>
              </label>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editConfig.sendReengagementMessage}
                  onChange={(e) =>
                    setEditConfig({ ...editConfig, sendReengagementMessage: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="text-sm">Send Re-engagement Message</span>
              </label>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSaveConfig}
              disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Configuration"}
            </button>
            <button
              onClick={() => setConfigOpen(false)}
              className="px-4 py-2 text-sm rounded-lg bg-background border border-border text-muted hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Active Trackers */}
      {trackers.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-3">Tracked Conversations</h3>
          <div className="space-y-2">
            {trackers
              .sort((a, b) => {
                // Waiting first, then by time
                if (a.status === "waiting" && b.status !== "waiting") return -1;
                if (a.status !== "waiting" && b.status === "waiting") return 1;
                return new Date(b.aiRespondedAt).getTime() - new Date(a.aiRespondedAt).getTime();
              })
              .slice(0, 20)
              .map((tracker) => (
                <div
                  key={tracker.prospectId}
                  className="flex items-center justify-between p-3 bg-background rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {tracker.status === "waiting" ? (
                      <Clock size={16} className="text-yellow-400" />
                    ) : tracker.status === "resumed" ? (
                      <Play size={16} className="text-green-400" />
                    ) : tracker.status === "prospect_replied" ? (
                      <ChatCircle size={16} className="text-blue-400" />
                    ) : (
                      <CheckCircle size={16} className="text-muted" />
                    )}
                    <div>
                      <div className="text-sm font-medium">{tracker.businessName}</div>
                      <div className="text-[10px] text-muted">
                        AI responded via {tracker.channel} at{" "}
                        {new Date(tracker.aiRespondedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {tracker.status === "waiting" ? (
                      <div>
                        <span className="text-xs text-yellow-400 font-medium">
                          {getTimeRemaining(tracker)}
                        </span>
                        <div className="text-[10px] text-muted">until auto-resume</div>
                      </div>
                    ) : tracker.status === "resumed" ? (
                      <span className="text-xs text-green-400">Auto-resumed</span>
                    ) : tracker.status === "prospect_replied" ? (
                      <span className="text-xs text-blue-400">Replied</span>
                    ) : (
                      <span className="text-xs text-muted">Handled</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {trackers.length === 0 && (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <Timer size={32} className="text-muted mx-auto mb-2" />
          <p className="text-sm text-muted">
            No conversations being tracked yet. When a prospect replies and the AI responds,
            the scheduler will automatically track the conversation and resume the funnel
            if they go silent.
          </p>
        </div>
      )}
    </div>
  );
}
