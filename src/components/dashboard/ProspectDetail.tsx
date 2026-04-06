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
}

interface ProspectDetailProps {
  prospect: Prospect | null;
  onClose: () => void;
  onSendEmail: (p: Prospect) => void;
  onStatusChange: (id: string, status: string) => void;
}

export default function ProspectDetail({
  prospect,
  onClose,
  onSendEmail,
  onStatusChange,
}: ProspectDetailProps) {
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [igData, setIgData] = useState<InstagramData | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!prospect) return;
    fetch(`/api/email/history/${prospect.id}`)
      .then((r) => r.json())
      .then((data) => setEmails(data.emails || []))
      .catch(() => setEmails([]));
    fetch(`/api/instagram/${prospect.id}`)
      .then((r) => r.json())
      .then((data) => setIgData(data))
      .catch(() => setIgData(null));
    setCopiedIdx(null);
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

          {/* Review Banner */}
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
                    const res = await fetch(`/api/sms/send/${prospect.id}`, { method: "POST" });
                    const data = await res.json();
                    if (res.ok) alert(`SMS sent to ${prospect.phone}!`);
                    else alert(`Error: ${data.error}`);
                  }}
                  className="w-full h-10 rounded-lg bg-blue-500/10 text-blue-400 text-sm font-medium hover:bg-blue-500/20 transition-colors"
                >
                  Send SMS
                </button>
              )}
              {prospect.status === "pending-review" && prospect.email && (
                <p className="text-xs text-muted text-center">Approve this site before sending outreach</p>
              )}
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
                <option value="approved">Approved</option>
                <option value="deployed">Deployed</option>
                <option value="contacted">Contacted</option>
                <option value="responded">Responded</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </section>

          {/* Instagram DMs */}
          {igData && (
            <section>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
                Instagram Outreach
              </h3>

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

              {/* DM Messages to copy */}
              <div className="space-y-3">
                {igData.dms.map((dm, idx) => (
                  <div
                    key={dm.type}
                    className="p-3 rounded-lg bg-surface-light border border-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-purple-400 uppercase">
                        {dm.type === "initial"
                          ? "DM #1 — Initial"
                          : dm.type === "follow-up-1"
                            ? "DM #2 — Follow-up (3 days)"
                            : "DM #3 — Final (7 days)"}
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
                ))}
              </div>
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
    </div>
  );
}
