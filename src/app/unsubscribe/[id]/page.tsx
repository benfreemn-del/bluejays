"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";

type UnsubscribeState = "loading" | "confirm" | "processing" | "done" | "already" | "error";

export default function UnsubscribePage() {
  const params = useParams();
  const id = params.id as string;
  const [state, setState] = useState<UnsubscribeState>("loading");
  const [businessName, setBusinessName] = useState<string>("");

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/unsubscribe/${id}`);
      const data = await res.json();

      if (data.alreadyUnsubscribed) {
        setState("already");
        setBusinessName(data.businessName || "");
      } else {
        setState("confirm");
        setBusinessName(data.businessName || "");
      }
    } catch {
      setState("confirm");
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      checkStatus();
    }
  }, [id, checkStatus]);

  const handleUnsubscribe = async () => {
    setState("processing");

    try {
      const res = await fetch(`/api/unsubscribe/${id}`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        setState("done");
        if (data.businessName) setBusinessName(data.businessName);
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#050a14] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600" />
            <span className="text-xl font-bold text-white">BlueJays</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#0a1628] border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
          {state === "loading" && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-white/20 border-t-sky-500 rounded-full animate-spin mx-auto" />
              <p className="text-white/40 text-sm mt-4">Loading...</p>
            </div>
          )}

          {state === "confirm" && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Unsubscribe from Emails</h1>
              {businessName && (
                <p className="text-white/40 text-sm mb-6">
                  Unsubscribe <span className="text-white/60 font-medium">{businessName}</span> from all BlueJays communications.
                </p>
              )}
              {!businessName && (
                <p className="text-white/40 text-sm mb-6">
                  You will stop receiving all emails and messages from BlueJays.
                </p>
              )}
              <p className="text-white/30 text-xs mb-6">
                This will immediately stop all outreach including emails, text messages, and voicemail drops.
              </p>
              <button
                onClick={handleUnsubscribe}
                className="w-full h-12 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-semibold text-sm hover:bg-red-500/20 hover:border-red-500/50 transition-all"
              >
                Confirm Unsubscribe
              </button>
              <p className="text-white/20 text-xs mt-4">
                Changed your mind? Simply close this page.
              </p>
            </div>
          )}

          {state === "processing" && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-white/20 border-t-sky-500 rounded-full animate-spin mx-auto" />
              <p className="text-white/40 text-sm mt-4">Processing your request...</p>
            </div>
          )}

          {state === "done" && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white mb-2">You&apos;ve Been Unsubscribed</h1>
              <p className="text-white/40 text-sm mb-2">
                All outreach has been stopped immediately.
              </p>
              {businessName && (
                <p className="text-white/30 text-xs mb-6">
                  {businessName} will no longer receive any communications from BlueJays.
                </p>
              )}
              <div className="p-4 rounded-xl bg-green-500/[0.05] border border-green-500/10">
                <p className="text-green-400/80 text-sm">
                  No further emails, texts, or calls will be sent to you.
                </p>
              </div>
            </div>
          )}

          {state === "already" && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-sky-500/10 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Already Unsubscribed</h1>
              <p className="text-white/40 text-sm">
                {businessName ? `${businessName} is` : "You are"} already unsubscribed from all BlueJays communications.
              </p>
              <p className="text-white/30 text-xs mt-4">
                No further action is needed.
              </p>
            </div>
          )}

          {state === "error" && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Something Went Wrong</h1>
              <p className="text-white/40 text-sm mb-6">
                We couldn&apos;t process your unsubscribe request. Please try again.
              </p>
              <button
                onClick={handleUnsubscribe}
                className="w-full h-12 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white font-semibold text-sm hover:bg-white/[0.08] transition-all"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-white/15 text-xs mt-8">
          BlueJays Web Design
        </p>
      </div>
    </div>
  );
}
