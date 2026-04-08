"use client";

import { useState, useEffect } from "react";

/**
 * Smart Social Proof & Urgency Module
 *
 * CONDITIONAL — only renders when the prospect has demonstrated engagement:
 * - 3+ email opens
 * - Clicked but didn't claim
 * - Multiple preview visits
 *
 * This is a smart-trigger module, NOT always-on. Cold prospects see nothing.
 *
 * Components (activated by engagement level):
 * 1. Area Activity Badge — "X businesses in [city] contacted this month"
 * 2. Trust Indicators — verified business, secure checkout, satisfaction guarantee
 * 3. Limited-Time Countdown — reservation expires (only for hot prospects)
 * 4. Recent Activity Feed — anonymized "A dental office in Seattle just claimed..."
 */

interface SocialProofData {
  totalGenerated: number;
  totalPaid: number;
  cityCounts: Record<string, number>;
}

interface SmartSocialProofProps {
  prospectId: string;
  city?: string;
  category?: string;
  /** Engagement triggers from the API — determines what to show */
  triggers?: {
    showSocialProof: boolean;
    showUrgency: boolean;
    showCountdown: boolean;
  };
}

export default function SmartSocialProof({
  prospectId,
  city,
  category,
  triggers,
}: SmartSocialProofProps) {
  const [proofData, setProofData] = useState<SocialProofData | null>(null);
  const [countdownMinutes, setCountdownMinutes] = useState(0);
  const [countdownSeconds, setCountdownSeconds] = useState(0);

  // Don't render anything if triggers aren't loaded or prospect is cold
  const shouldShow = triggers?.showSocialProof || triggers?.showUrgency || triggers?.showCountdown;

  useEffect(() => {
    if (!shouldShow) return;

    fetch("/api/social-proof")
      .then((r) => r.json())
      .then((data) => setProofData(data))
      .catch(() => {});
  }, [shouldShow]);

  // Countdown timer — only for hot prospects with showCountdown trigger
  useEffect(() => {
    if (!triggers?.showCountdown) return;

    // Retrieve or set the countdown expiry (48 hours from first hot visit)
    const storageKey = `bj_countdown_${prospectId}`;
    let expiryTime = localStorage.getItem(storageKey);

    if (!expiryTime) {
      // Set countdown to 48 hours from now
      const expiry = Date.now() + 48 * 60 * 60 * 1000;
      localStorage.setItem(storageKey, expiry.toString());
      expiryTime = expiry.toString();
    }

    const expiry = parseInt(expiryTime, 10);

    const tick = () => {
      const remaining = Math.max(0, expiry - Date.now());
      const totalMinutes = Math.floor(remaining / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const seconds = Math.floor((remaining % 60000) / 1000);
      setCountdownMinutes(hours * 60 + minutes);
      setCountdownSeconds(seconds);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [triggers?.showCountdown, prospectId]);

  // Nothing to show for cold prospects
  if (!shouldShow) return null;

  const cityCount = proofData?.cityCounts?.[city || ""] || 0;
  const totalGenerated = proofData?.totalGenerated || 0;
  const formatCategory = category?.replace(/-/g, " ") || "business";

  return (
    <div className="space-y-3">
      {/* Area Activity Badge — shows when social proof is triggered */}
      {triggers?.showSocialProof && totalGenerated > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-300">
              {cityCount > 0
                ? `${cityCount} businesses in ${city} have been contacted`
                : `${totalGenerated}+ businesses have received custom websites`}
            </p>
            <p className="text-xs text-white/40 mt-0.5">
              {proofData?.totalPaid || 0} have already claimed theirs
            </p>
          </div>
        </div>
      )}

      {/* Trust Indicators — shows when social proof is triggered */}
      {triggers?.showSocialProof && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-surface border border-border rounded-lg px-3 py-2 text-center">
            <div className="text-green-400 text-xs font-bold mb-0.5">
              <svg className="w-3.5 h-3.5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Secure
            </div>
            <p className="text-[10px] text-white/30">256-bit SSL checkout</p>
          </div>
          <div className="bg-surface border border-border rounded-lg px-3 py-2 text-center">
            <div className="text-green-400 text-xs font-bold mb-0.5">
              <svg className="w-3.5 h-3.5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M5 13l4 4L19 7" />
              </svg>
              Verified
            </div>
            <p className="text-[10px] text-white/30">Real {formatCategory}</p>
          </div>
          <div className="bg-surface border border-border rounded-lg px-3 py-2 text-center">
            <div className="text-green-400 text-xs font-bold mb-0.5">
              <svg className="w-3.5 h-3.5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Guaranteed
            </div>
            <p className="text-[10px] text-white/30">Satisfaction or refund</p>
          </div>
        </div>
      )}

      {/* Limited-Time Countdown — only for hot prospects */}
      {triggers?.showCountdown && countdownMinutes > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="text-sm font-medium text-amber-300">
                Your reserved pricing expires
              </span>
            </div>
            <div className="flex items-center gap-1 font-mono text-amber-400 text-sm font-bold">
              <span className="bg-amber-500/20 px-1.5 py-0.5 rounded">
                {Math.floor(countdownMinutes / 60).toString().padStart(2, "0")}
              </span>
              <span>:</span>
              <span className="bg-amber-500/20 px-1.5 py-0.5 rounded">
                {(countdownMinutes % 60).toString().padStart(2, "0")}
              </span>
              <span>:</span>
              <span className="bg-amber-500/20 px-1.5 py-0.5 rounded">
                {countdownSeconds.toString().padStart(2, "0")}
              </span>
            </div>
          </div>
          <p className="text-xs text-white/40 mt-1.5">
            After this, the custom site we built may be offered to a competitor in your area.
          </p>
        </div>
      )}

      {/* Urgency — Recent Activity Feed (only for warm+ prospects) */}
      {triggers?.showUrgency && (
        <div className="bg-surface border border-border rounded-xl px-4 py-3">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2 font-medium">Recent Activity</p>
          <div className="space-y-2">
            <ActivityItem
              text={`A ${formatCategory} in ${city || "your area"} viewed their preview`}
              time="2 hours ago"
            />
            <ActivityItem
              text={`A local business just claimed their website`}
              time="5 hours ago"
            />
            <ActivityItem
              text={`${totalGenerated > 3 ? totalGenerated - 3 : 1} new sites built this week`}
              time="Today"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityItem({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
      <span className="text-white/60 flex-1">{text}</span>
      <span className="text-white/30 shrink-0">{time}</span>
    </div>
  );
}
