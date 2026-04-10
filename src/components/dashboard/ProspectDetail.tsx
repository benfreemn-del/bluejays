import type { Prospect } from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import { useState, useEffect } from "react";

interface EmailRecord {
  id: string;
  subject: string;
  sequence: number;
  sentAt: string;
}

interface DmMessage {
  type: string;
  message: string;
  previewUrl: string;
}

interface InstagramData {
  businessName: string;
  instagramHandle: string | null;
  instagramSearchUrl: string;
  instagramProfileUrl: string | null;
  dms: DmMessage[];
  outreach?: {
    templates: {
      stepType: string;
      funnelDay: number;
      label: string;
      message: string;
      characterCount: number;
    }[];
    dmHistory: {
      id: string;
      stepType: string;
      message: string;
      sentAt: string;
      status: string;
    }[];
  };
}

interface ProspectDetailProps {
  prospect: Prospect | null;
  onClose: () => void;
  onSendEmail: (p: Prospect) => void;
  onStatusChange: (id: string, status: string) => void;
  onUpdateProspect?: (id: string, updates: Partial<Prospect>) => void;
}

export default function ProspectDetail({
  prospect,
  onClose,
  onSendEmail,
  onStatusChange,
  onUpdateProspect,
}: ProspectDetailProps) {
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [igData, setIgData] = useState<InstagramData | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [vslScript, setVslScript] = useState<Record<string, string> | null>(null);
  const [vslLoading, setVslLoading] = useState(false);
  const [vslExpanded, setVslExpanded] = useState(false);
  const [igTab, setIgTab] = useState<"templates" | "history">("templates");
  const [igHandleEdit, setIgHandleEdit] = useState("");
  const [igHandleSaving, setIgHandleSaving] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [simReport, setSimReport] = useState<any>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [simOpen, setSimOpen] = useState(false);
  // QC gate state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [qcResult, setQcResult] = useState<any>(null);
  const [qcLoading, setQcLoading] = useState(false);
  const [qcExpanded, setQcExpanded] = useState(false);

  useEffect(() => {
    if (!prospect) return;
    fetch(`/api/email/history/${prospect.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setEmails(data.emails || []))
      .catch(() => setEmails([]));
    fetch(`/api/instagram/${prospect.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setIgData(data))
      .catch(() => setIgData(null));
    fetch(`/api/vsl/generate/${prospect.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setVslScript(data.vslScript || null))
      .catch(() => setVslScript(null));
    setCopiedIdx(null);
    setVslExpanded(false);
  }, [prospect]);

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  if (!prospect) return null;

  const config = CATEGORY_CONFIG[prospect.category];

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative ml-auto w-full max-w-lg bg-surface border-l border-border overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-border p-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">{prospect.businessName}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span
                className="text-xs font-medium px-2 py-1 rounded"
                style={{
                  backgroundColor: config.accentColor + "20",
                  color: config.accentColor,
                }}
              >
                {config.label}
              </span>
              <StatusBadge status={prospect.status} />
              {prospect.pricingTier === "free" && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold tracking-wide border border-emerald-500/30">Free</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground text-xl"
          >
            x
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Pricing Tier Toggle */}
          <section className="p-4 rounded-xl bg-surface-light border border-border">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
              Pricing Tier
            </h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onUpdateProspect?.(prospect.id, { pricingTier: "standard" })}
                className={`flex-1 h-10 rounded-lg text-sm font-medium transition-colors ${
                  (!prospect.pricingTier || prospect.pricingTier === "standard")
                    ? "bg-sky-500/20 text-sky-400 border border-sky-500/40"
                    : "bg-surface border border-border text-muted hover:text-foreground"
                }`}
              >
                Standard ($997)
              </button>
              <button
                onClick={() => onUpdateProspect?.(prospect.id, { pricingTier: "free" })}
                className={`flex-1 h-10 rounded-lg text-sm font-medium transition-colors ${
                  prospect.pricingTier === "free"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-surface border border-border text-muted hover:text-foreground"
                }`}
              >
                Free ($30)
              </button>
            </div>
            {prospect.pricingTier === "free" && (
              <p className="text-xs text-emerald-400/70 mt-2">
                Friends/family pricing — $30 covers domain + server costs. $100/yr management after 1 year.
              </p>
            )}
          </section>

          {/* Contact Info */}
          <section>
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
              Contact Info
            </h3>
            <div className="space-y-2 text-sm">
              {prospect.ownerName && (
                <div className="flex justify-between">
                  <span className="text-muted">Owner</span>
                  <span>{prospect.ownerName}</span>
                </div>
              )}
              {prospect.phone && (
                <div className="flex justify-between">
                  <span className="text-muted">Phone</span>
                  <span>{prospect.phone}</span>
                </div>
              )}
              {prospect.email && (
                <div className="flex justify-between">
                  <span className="text-muted">Email</span>
                  <span className="text-blue-electric">{prospect.email}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">Address</span>
                <span className="text-right">
                  {prospect.address}, {prospect.city}, {prospect.state}
                </span>
              </div>
              {prospect.currentWebsite && (
                <div className="flex justify-between">
                  <span className="text-muted">Website</span>
                  <a
                    href={prospect.currentWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-electric"
                  >
                    View
                  </a>
                </div>
              )}
              {prospect.googleRating && (
                <div className="flex justify-between">
                  <span className="text-muted">Rating</span>
                  <span className="text-yellow-400">
                    {prospect.googleRating} ({prospect.reviewCount} reviews)
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Scraped Services */}
          {prospect.scrapedData?.services &&
            prospect.scrapedData.services.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
                  Services Found
                </h3>
                <div className="space-y-1">
                  {prospect.scrapedData.services.map((s, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-sm py-1 border-b border-border/50"
                    >
                      <span>{s.name}</span>
                      {s.price && (
                        <span style={{ color: config.accentColor }}>
                          {s.price}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* Theme Toggle */}
          {prospect.generatedSiteUrl && (
            <ThemeToggleSection
              prospect={prospect}
              onUpdateProspect={onUpdateProspect}
            />
          )}

          {/* Review Banner — pending-review (legacy) */}
          {prospect.status === "pending-review" && (
            <section className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <h3 className="text-sm font-bold text-red-400 mb-2">
                Needs Your Review
              </h3>
              <p className="text-muted text-xs mb-3">
                This site was auto-generated and needs your approval before being sent to the customer.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => onStatusChange(prospect.id, "approved")}
                  className="flex-1 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-colors"
                >
                  Approve
                </button>
                <a
                  href={prospect.generatedSiteUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-10 rounded-lg bg-blue-electric/20 text-blue-electric text-sm font-medium flex items-center justify-center hover:bg-blue-electric/30 transition-colors"
                >
                  Review Site
                </a>
              </div>
            </section>
          )}

          {/* QC Gate Banner — ready_to_review (passed) */}
          {prospect.status === "ready_to_review" && (
            <section className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-emerald-400">QC Passed ✓ — Ready for Review</h3>
                {prospect.qualityScore !== undefined && (
                  <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                    Score: {prospect.qualityScore}/100
                  </span>
                )}
              </div>
              <p className="text-muted text-xs mb-3">
                This site passed automated QC checks. Review it and approve to start outreach.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => onStatusChange(prospect.id, "approved")}
                  className="flex-1 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-colors"
                >
                  Approve
                </button>
                <a
                  href={prospect.generatedSiteUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-10 rounded-lg bg-blue-electric/20 text-blue-electric text-sm font-medium flex items-center justify-center hover:bg-blue-electric/30 transition-colors"
                >
                  Review Site
                </a>
              </div>
              {prospect.qualityNotes && (
                <button
                  onClick={() => setQcExpanded(!qcExpanded)}
                  className="mt-2 w-full text-xs text-emerald-400/60 hover:text-emerald-400 text-left"
                >
                  {qcExpanded ? "Hide QC Notes" : "Show QC Notes"}
                </button>
              )}
              {qcExpanded && prospect.qualityNotes && (
                <pre className="mt-2 text-xs text-muted whitespace-pre-wrap bg-black/20 rounded p-2 max-h-40 overflow-y-auto">
                  {prospect.qualityNotes}
                </pre>
              )}
            </section>
          )}

          {/* QC Gate Banner — qc_failed */}
          {prospect.status === "qc_failed" && (
            <section className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-rose-400">QC Failed ✗ — Needs Fixes</h3>
                {prospect.qualityScore !== undefined && (
                  <span className="text-xs font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full">
                    Score: {prospect.qualityScore}/100
                  </span>
                )}
              </div>
              <p className="text-muted text-xs mb-3">
                This site failed QC checks. Fix the issues below, then re-run QC.
              </p>
              {prospect.qualityNotes && (
                <pre className="text-xs text-muted whitespace-pre-wrap bg-black/20 rounded p-2 max-h-48 overflow-y-auto mb-3">
                  {prospect.qualityNotes}
                </pre>
              )}
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    setQcLoading(true);
                    try {
                      const res = await fetch(`/api/qc/review/${prospect.id}`, { method: "POST", credentials: "include" });
                      const data = await res.json();
                      setQcResult(data);
                      if (data.status) onStatusChange(prospect.id, data.status);
                    } catch { /* ignore */ }
                    setQcLoading(false);
                  }}
                  disabled={qcLoading}
                  className="flex-1 h-10 rounded-lg bg-rose-500/20 text-rose-400 text-sm font-medium hover:bg-rose-500/30 transition-colors disabled:opacity-50"
                >
                  {qcLoading ? "Running QC..." : "Re-run QC"}
                </button>
                <a
                  href={prospect.generatedSiteUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-10 rounded-lg bg-blue-electric/20 text-blue-electric text-sm font-medium flex items-center justify-center hover:bg-blue-electric/30 transition-colors"
                >
                  View Site
                </a>
              </div>
              {qcResult && (
                <p className="mt-2 text-xs text-center" style={{ color: qcResult.passed ? "#34d399" : "#fb7185" }}>
                  QC re-run: {qcResult.passed ? `PASSED (${qcResult.score}/100)` : `FAILED (${qcResult.score}/100)`}
                </p>
              )}
            </section>
          )}

          {/* VSL Script */}
          <section>
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
              Video Sales Letter
            </h3>
            {vslScript ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">Script Ready</span>
                    {(vslScript as Record<string, string>).wordCount && (
                      <span className="text-xs text-muted">{(vslScript as Record<string, string>).wordCount} words &middot; ~{(vslScript as Record<string, string>).estimatedDuration}</span>
                    )}
                  </div>
                  <button
                    onClick={() => setVslExpanded(!vslExpanded)}
                    className="text-xs px-3 py-1 rounded-lg bg-surface-light border border-border text-muted hover:text-foreground"
                  >
                    {vslExpanded ? "Collapse" : "Preview"}
                  </button>
                </div>
                {vslExpanded && (
                  <div className="space-y-3">
                    {["hook", "agitate", "solution", "proof", "cta"].map((section) => (
                      <div key={section} className="p-3 rounded-lg bg-surface-light border border-border">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-2">
                          {section === "hook" ? "Hook (Pain Point)" : section === "agitate" ? "Agitate (What They're Losing)" : section === "solution" ? "Solution (BlueJays Offer)" : section === "proof" ? "Proof (Their Data)" : "CTA (Claim Site)"}
                        </span>
                        <p className="text-xs text-muted leading-relaxed whitespace-pre-wrap">
                          {(vslScript as Record<string, string>)[section]}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={async () => {
                    setVslLoading(true);
                    try {
                      const res = await fetch(`/api/vsl/generate/${prospect.id}`, { method: "POST" });
                      const data = await res.json();
                      if (data.vslScript) { setVslScript(data.vslScript); setVslExpanded(true); }
                    } catch { /* ignore */ }
                    setVslLoading(false);
                  }}
                  disabled={vslLoading}
                  className="w-full h-9 rounded-lg bg-amber-500/10 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors disabled:opacity-50"
                >
                  {vslLoading ? "Regenerating..." : "Regenerate VSL Script"}
                </button>
              </div>
            ) : (
              <button
                onClick={async () => {
                  setVslLoading(true);
                  try {
                    const res = await fetch(`/api/vsl/generate/${prospect.id}`, { method: "POST" });
                    const data = await res.json();
                    if (data.vslScript) { setVslScript(data.vslScript); setVslExpanded(true); }
                  } catch { /* ignore */ }
                  setVslLoading(false);
                }}
                disabled={vslLoading}
                className="w-full h-10 rounded-lg bg-amber-500/10 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors disabled:opacity-50"
              >
                {vslLoading ? "Generating VSL Script..." : "Generate VSL Script"}
              </button>
            )}
          </section>

          {/* Actions */}
          <section>
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
              Actions
            </h3>
            <div className="space-y-2">
              {prospect.generatedSiteUrl && (
                <a
                  href={prospect.generatedSiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-10 rounded-lg bg-blue-electric/10 text-blue-electric text-sm font-medium flex items-center justify-center hover:bg-blue-electric/20 transition-colors"
                >
                  View Preview Site
                </a>
              )}
              {prospect.email && prospect.generatedSiteUrl && (prospect.status === "approved" || prospect.status === "deployed" || prospect.status === "generated") && (
                <button
                  onClick={() => onSendEmail(prospect)}
                  className="w-full h-10 rounded-lg bg-green-500/10 text-green-400 text-sm font-medium hover:bg-green-500/20 transition-colors"
                >
                  Send Pitch Email
                </button>
              )}
              {prospect.phone && prospect.generatedSiteUrl && (prospect.status === "approved" || prospect.status === "deployed" || prospect.status === "generated") && (
                <button
                  onClick={async () => {
                    const res = await fetch(`/api/sms/send/${prospect.id}`, { method: "POST", credentials: "include" });
                    const data = await res.json();
                    if (res.ok) alert(`SMS sent to ${prospect.phone}!`);
                    else alert(`Error: ${data.error}`);
                  }}
                  className="w-full h-10 rounded-lg bg-blue-500/10 text-blue-400 text-sm font-medium hover:bg-blue-500/20 transition-colors"
                >
                  Send SMS
                </button>
              )}
              {(prospect.status === "pending-review" || prospect.status === "ready_to_review" || prospect.status === "qc_failed") && prospect.email && (
                <p className="text-xs text-muted text-center">
                  {prospect.status === "qc_failed" ? "Fix QC issues before sending outreach" : "Approve this site before sending outreach"}
                </p>
              )}
              <button
                onClick={async () => {
                  setSimLoading(true);
                  try {
                    const res = await fetch(`/api/funnel/simulate/${prospect.id}`, { credentials: 'include' });
                    const data = await res.json();
                    setSimReport(data);
                    setSimOpen(true);
                  } catch { /* ignore */ }
                  setSimLoading(false);
                }}
                disabled={simLoading}
                className="w-full h-10 rounded-lg bg-cyan-500/10 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 transition-colors disabled:opacity-50"
              >
                {simLoading ? "Simulating..." : "Simulate Funnel"}
              </button>
              <select
                value={prospect.status}
                onChange={(e) =>
                  onStatusChange(prospect.id, e.target.value)
                }
                className="w-full h-10 px-3 rounded-lg bg-surface-light border border-border text-foreground text-sm"
              >
                <option value="scouted">Scouted</option>
                <option value="scraped">Scraped</option>
                <option value="generated">Generated</option>
                <option value="pending-review">Needs Review</option>
                <option value="ready_to_review">QC Passed</option>
                <option value="qc_failed">QC Failed</option>
                <option value="approved">Approved</option>
                <option value="deployed">Deployed</option>
                <option value="contacted">Contacted</option>
                <option value="responded">Responded</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </section>

          {/* Instagram Outreach */}
          {igData && (
            <section>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
                Instagram Outreach
              </h3>

              {/* Instagram Handle */}
              <div className="mb-3 p-3 rounded-lg bg-surface-light border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted">Instagram Handle</span>
                  {igData.instagramHandle && (
                    <span className="text-xs text-purple-400">{igData.instagramHandle}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="@handle"
                    value={igHandleEdit}
                    onChange={(e) => setIgHandleEdit(e.target.value)}
                    className="flex-1 h-8 px-3 rounded-lg bg-surface border border-border text-foreground text-xs"
                  />
                  <button
                    onClick={async () => {
                      if (!igHandleEdit.trim() || !prospect) return;
                      setIgHandleSaving(true);
                      try {
                        await fetch(`/api/instagram/${prospect.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ instagramHandle: igHandleEdit.trim() }),
                        });
                        // Refresh IG data
                        const res = await fetch(`/api/instagram/${prospect.id}`, { credentials: 'include' });
                        const data = await res.json();
                        setIgData(data);
                        setIgHandleEdit("");
                      } catch { /* ignore */ }
                      setIgHandleSaving(false);
                    }}
                    disabled={igHandleSaving || !igHandleEdit.trim()}
                    className="h-8 px-3 rounded-lg bg-purple-500/10 text-purple-400 text-xs font-medium hover:bg-purple-500/20 disabled:opacity-50"
                  >
                    {igHandleSaving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>

              {/* Find on Instagram */}
              <div className="mb-4 flex gap-2">
                {igData.instagramProfileUrl ? (
                  <a
                    href={igData.instagramProfileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-9 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium flex items-center justify-center hover:opacity-90 transition-opacity"
                  >
                    Open Instagram Profile
                  </a>
                ) : (
                  <a
                    href={igData.instagramSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-9 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium flex items-center justify-center hover:opacity-90 transition-opacity"
                  >
                    Find on Instagram
                  </a>
                )}
              </div>

              {/* Tab Navigation */}
              <div className="flex gap-1 mb-3">
                <button
                  onClick={() => setIgTab("templates")}
                  className={`flex-1 h-8 rounded-lg text-xs font-medium transition-colors ${
                    igTab === "templates" ? "bg-purple-500/20 text-purple-400" : "bg-surface-light text-muted hover:text-foreground"
                  }`}
                >
                  DM Templates ({igData.outreach?.templates?.length || igData.dms.length})
                </button>
                <button
                  onClick={() => setIgTab("history")}
                  className={`flex-1 h-8 rounded-lg text-xs font-medium transition-colors ${
                    igTab === "history" ? "bg-purple-500/20 text-purple-400" : "bg-surface-light text-muted hover:text-foreground"
                  }`}
                >
                  DM History
                </button>
              </div>

              {/* Templates Tab */}
              {igTab === "templates" && (
                <div className="space-y-3">
                  {(igData.outreach?.templates || []).length > 0 ? (
                    igData.outreach!.templates.map((tmpl, idx) => (
                      <div
                        key={tmpl.stepType}
                        className="p-3 rounded-lg bg-surface-light border border-border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-purple-400">
                              {tmpl.label}
                            </span>
                            <span className="text-[10px] text-muted">Day {tmpl.funnelDay}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted">{tmpl.characterCount} chars</span>
                            <button
                              onClick={() => copyToClipboard(tmpl.message, idx + 100)}
                              className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                                copiedIdx === idx + 100
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
                              }`}
                            >
                              {copiedIdx === idx + 100 ? "Copied!" : "Copy"}
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-muted leading-relaxed">
                          {tmpl.message}
                        </p>
                      </div>
                    ))
                  ) : (
                    /* Fallback to legacy DMs */
                    igData.dms.map((dm, idx) => (
                      <div
                        key={dm.type}
                        className="p-3 rounded-lg bg-surface-light border border-border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-purple-400 uppercase">
                            {dm.type === "initial"
                              ? "DM #1 \u2014 Initial"
                              : dm.type === "follow-up-1"
                                ? "DM #2 \u2014 Follow-up"
                                : "DM #3 \u2014 Final"}
                          </span>
                          <button
                            onClick={() => copyToClipboard(dm.message, idx)}
                            className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                              copiedIdx === idx
                                ? "bg-green-500/20 text-green-400"
                                : "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
                            }`}
                          >
                            {copiedIdx === idx ? "Copied!" : "Copy DM"}
                          </button>
                        </div>
                        <p className="text-sm text-muted leading-relaxed">
                          {dm.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* History Tab */}
              {igTab === "history" && (
                <div>
                  {(igData.outreach?.dmHistory || []).length > 0 ? (
                    <div className="space-y-2">
                      {igData.outreach!.dmHistory.map((entry) => (
                        <div key={entry.id} className="p-3 rounded-lg bg-surface-light border border-border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-purple-400">{entry.stepType}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                              entry.status === "read" || entry.status === "replied" ? "bg-emerald-500/10 text-emerald-400" :
                              entry.status === "sent" || entry.status === "delivered" ? "bg-blue-500/10 text-blue-400" :
                              entry.status === "failed" ? "bg-red-500/10 text-red-400" :
                              "bg-yellow-500/10 text-yellow-400"
                            }`}>{entry.status}</span>
                          </div>
                          <p className="text-xs text-muted">{entry.message.slice(0, 100)}...</p>
                          <p className="text-[10px] text-muted mt-1">{new Date(entry.sentAt).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-muted">
                      <p>No DMs sent yet.</p>
                      <p className="mt-1">Copy a template from the Templates tab and send it manually via Instagram.</p>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Email History */}
          <section>
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
              Email History
            </h3>
            {emails.length > 0 ? (
              <div className="space-y-2">
                {emails.map((email) => (
                  <div
                    key={email.id}
                    className="p-3 rounded-lg bg-surface-light border border-border text-sm"
                  >
                    <p className="font-medium">{email.subject}</p>
                    <p className="text-muted text-xs mt-1">
                      Sequence #{email.sequence} &middot;{" "}
                      {new Date(email.sentAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-sm">No emails sent yet.</p>
            )}
          </section>
        </div>
      </div>

      {/* Funnel Simulation Modal */}
      {simOpen && simReport && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSimOpen(false)} />
          <div className="relative w-full max-w-2xl max-h-[85vh] bg-surface border border-border rounded-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-border flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-bold">Funnel Simulation</h3>
                <p className="text-sm text-muted mt-1">{simReport.businessName}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                  simReport.overallPassed
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-red-500/20 text-red-400"
                }`}>
                  {simReport.overallPassed ? "ALL PASSED" : `${simReport.failedSteps} FAILED`}
                </span>
                <button onClick={() => setSimOpen(false)} className="text-muted hover:text-foreground text-xl">x</button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-5 space-y-4">
              {/* Global Checks */}
              <div className="p-4 rounded-xl bg-surface-light border border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Pre-Flight Checks</h4>
                <div className="space-y-1.5">
                  {simReport.globalChecks.map((check: { name: string; passed: boolean; message: string; severity: string }, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className={`shrink-0 mt-0.5 ${check.passed ? "text-emerald-400" : check.severity === "critical" ? "text-red-400" : "text-yellow-400"}`}>
                        {check.passed ? "\u2713" : check.severity === "critical" ? "\u2717" : "\u26A0"}
                      </span>
                      <span className="text-muted">{check.message}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step Results */}
              {simReport.steps.map((step: { stepIndex: number; day: number; label: string; channels: string[]; passed: boolean; email?: { subject: string; bodyPreview: string }; sms?: { content: string; charCount: number }; voicemail?: { script: string; trigger: string }; statusChange?: string; checks: { name: string; passed: boolean; message: string; severity: string }[] }) => (
                <div key={step.stepIndex} className={`p-4 rounded-xl border ${
                  step.passed ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        step.passed ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                      }`}>
                        {step.passed ? "PASS" : "FAIL"}
                      </span>
                      <span className="text-sm font-semibold">Day {step.day}: {step.label}</span>
                    </div>
                    <div className="flex gap-1">
                      {step.channels.map((ch: string) => (
                        <span key={ch} className={`text-[10px] px-2 py-0.5 rounded-full ${
                          ch === "email" ? "bg-green-500/10 text-green-400" :
                          ch === "sms" ? "bg-blue-500/10 text-blue-400" :
                          "bg-orange-500/10 text-orange-400"
                        }`}>{ch}</span>
                      ))}
                    </div>
                  </div>

                  {/* Email preview */}
                  {step.email && (
                    <div className="mb-2 p-3 rounded-lg bg-surface border border-border">
                      <p className="text-xs font-medium text-green-400 mb-1">Email</p>
                      <p className="text-xs font-semibold">{step.email.subject}</p>
                      <p className="text-[11px] text-muted mt-1 line-clamp-2">{step.email.bodyPreview}</p>
                    </div>
                  )}

                  {/* SMS preview */}
                  {step.sms && (
                    <div className="mb-2 p-3 rounded-lg bg-surface border border-border">
                      <p className="text-xs font-medium text-blue-400 mb-1">SMS ({step.sms.charCount} chars)</p>
                      <p className="text-[11px] text-muted">{step.sms.content}</p>
                    </div>
                  )}

                  {/* Voicemail preview */}
                  {step.voicemail && (
                    <div className="mb-2 p-3 rounded-lg bg-surface border border-border">
                      <p className="text-xs font-medium text-orange-400 mb-1">Voicemail &middot; {step.voicemail.trigger}</p>
                      <p className="text-[11px] text-muted">{step.voicemail.script}</p>
                    </div>
                  )}

                  {/* Status change */}
                  {step.statusChange && (
                    <p className="text-[11px] text-cyan-400 mb-2">Status changes to: {step.statusChange}</p>
                  )}

                  {/* Checks */}
                  <div className="space-y-1">
                    {step.checks.filter((c: { severity: string }) => c.severity !== "info").map((check: { name: string; passed: boolean; message: string; severity: string }, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-[11px]">
                        <span className={`shrink-0 ${check.passed ? "text-emerald-400" : check.severity === "critical" ? "text-red-400" : "text-yellow-400"}`}>
                          {check.passed ? "\u2713" : "\u2717"}
                        </span>
                        <span className="text-muted">{check.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Theme Toggle Section — Allows admin to switch between light/dark themes
 * for a prospect's preview site. Shows AI recommendation and allows override.
 */
function ThemeToggleSection({
  prospect,
  onUpdateProspect,
}: {
  prospect: Prospect;
  onUpdateProspect?: (id: string, updates: Partial<Prospect>) => void;
}) {
  const currentTheme = prospect.selectedTheme || prospect.aiThemeRecommendation || "dark";
  const aiRecommended = prospect.aiThemeRecommendation || "dark";
  const isOverridden = prospect.selectedTheme && prospect.selectedTheme !== aiRecommended;

  const handleThemeChange = async (theme: "light" | "dark") => {
    if (onUpdateProspect) {
      onUpdateProspect(prospect.id, { selectedTheme: theme });
    } else {
      // Fallback: direct API call
      await fetch(`/api/prospects/${prospect.id}`, { credentials: "include",
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedTheme: theme }),
      });
    }
  };

  return (
    <section className="p-4 rounded-xl border border-border bg-surface-light">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
          Theme
        </h3>
        {aiRecommended && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-electric/10 text-blue-electric">
            AI suggests: {aiRecommended}
          </span>
        )}
      </div>

      <div className="flex gap-2 mb-2">
        <button
          onClick={() => handleThemeChange("light")}
          className={`flex-1 h-10 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
            currentTheme === "light"
              ? "bg-white text-gray-900 border-2 border-blue-electric shadow-sm"
              : "bg-surface border border-border text-muted hover:text-foreground hover:border-border/80"
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
          Light
        </button>
        <button
          onClick={() => handleThemeChange("dark")}
          className={`flex-1 h-10 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
            currentTheme === "dark"
              ? "bg-gray-900 text-white border-2 border-blue-electric shadow-sm"
              : "bg-surface border border-border text-muted hover:text-foreground hover:border-border/80"
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
          Dark
        </button>
      </div>

      {isOverridden && (
        <p className="text-xs text-yellow-400 flex items-center gap-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
            <path d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
          </svg>
          Overriding AI recommendation ({aiRecommended})
        </p>
      )}

      {prospect.generatedSiteUrl && (
        <div className="mt-3 flex gap-2">
          <a
            href={`${prospect.generatedSiteUrl}?theme=${currentTheme}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-9 rounded-lg bg-blue-electric/10 text-blue-electric text-xs font-medium flex items-center justify-center hover:bg-blue-electric/20 transition-colors"
          >
            Preview {currentTheme} theme
          </a>
        </div>
      )}
    </section>
  );
}
