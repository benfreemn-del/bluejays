"use client";

/**
 * /opt-in-sms/[id] — Post-submit SMS opt-in upsell.
 *
 * Q11=B per CLAUDE.md Rule 35 update: when a prospect submits /get-started
 * WITHOUT ticking the optional SMS consent box, /api/leads/submit redirects
 * them here. The page asks once, politely, whether they want SMS too. They
 * can:
 *   - Tick "Yes, text me too" + confirm a phone number → POST to
 *     /api/leads/sms-opt-in/[id] which sets smsConsent=true on the row.
 *     Funnel-manager belt+suspenders gate (source==='inbound' AND
 *     smsConsent===true) then permits SMS for this prospect.
 *   - Click "No thanks, email is fine" → status persists as smsConsent=false
 *     and they go to a thank-you/finish state. No further upsell.
 *
 * NEVER make this required to view the preview, claim the site, or do
 * anything else. TCPA 47 CFR 64.1200(a)(7)(i): SMS consent cannot be a
 * condition of service.
 */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function OptInSmsPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // Pre-fill the phone field if it was already saved during /get-started
  // submit (e.g. they typed a phone but didn't tick the box). Saves a tap.
  useEffect(() => {
    if (!id) return;
    fetch(`/api/leads/sms-opt-in/${id}`, { method: "GET" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.phone) setPhone(j.phone as string);
      })
      .catch(() => {});
  }, [id]);

  const handleOptIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!agree) {
      setError("Please tick the SMS consent box if you want to opt in.");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/sms-opt-in/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, agree: true }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not save your opt-in. Try again.");
      }
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push("/");
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#050a14] flex items-center justify-center p-6 text-white">
        <div className="max-w-lg text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 mx-auto mb-5 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-8 h-8">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-3">You&apos;re opted in.</h1>
          <p className="text-white/50 leading-relaxed mb-6">
            We&apos;ll text you the preview link when it&apos;s ready. Reply STOP at any time to opt out.
          </p>
          <Link href="/" className="text-sky-400 hover:underline text-sm">
            ← Back to BlueJays
          </Link>
        </div>
      </div>
    );
  }

  const inputCls =
    "w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/25 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 focus:outline-none transition-all text-[16px]";

  return (
    <div className="min-h-screen bg-[#050a14] text-white">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-sky-500/[0.07] blur-[180px]" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-5 py-12 md:py-16">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-8 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 group-hover:shadow-[0_0_20px_rgba(14,165,233,0.4)] transition-shadow" />
          <span className="text-xl font-bold text-white">BlueJays</span>
        </Link>

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Your preview is being built
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">
            One quick optional step
          </h1>
          <p className="text-white/55 leading-relaxed">
            We&apos;ll email you when your preview is ready. If you&apos;d also like a quick text the moment it&apos;s live, opt in below. Totally optional — you&apos;ll get the preview either way.
          </p>
        </div>

        <form onSubmit={handleOptIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(206) 555-1234"
              className={inputCls}
            />
          </div>

          <label className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/10 cursor-pointer">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-white/20 bg-white/5 text-sky-500 focus:ring-sky-500 focus:ring-offset-0 focus:ring-2 cursor-pointer"
            />
            <span className="text-sm text-white/70 leading-relaxed">
              I agree to receive SMS text messages from BlueJay Business Solutions about my website preview at the phone number above. Consent is not required to receive a website preview. Message frequency varies (up to 4 messages per week). Message and data rates may apply. Reply STOP to opt out, HELP for help. See our{" "}
              <a href="/privacy" className="text-sky-400 hover:text-sky-300 underline">Privacy Policy</a>
              {" "}and{" "}
              <a href="/terms" className="text-sky-400 hover:text-sky-300 underline">Terms</a>.
            </span>
          </label>

          {error ? (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold disabled:opacity-50 hover:shadow-[0_0_30px_rgba(14,165,233,0.4)] active:scale-[0.98] transition-all duration-300"
          >
            {loading ? "Saving…" : "Yes, text me too"}
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="w-full h-12 rounded-xl border border-white/10 text-white/55 hover:text-white hover:border-white/20 transition-colors"
          >
            No thanks, email is fine
          </button>
        </form>

        <p className="mt-6 text-center text-white/30 text-xs">
          Either choice works. We respect your inbox.
        </p>
      </div>
    </div>
  );
}
