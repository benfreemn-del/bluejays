"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import SmartSocialProof from "@/components/SmartSocialProof";

/**
 * CLAIM PAGE — Conversion-Optimized Layout
 *
 * Structure:
 * 1. Hero section: business name, "what you get" value breakdown
 * 2. Before/After visual comparison
 * 3. Trust badges + money-back guarantee
 * 4. Detailed "what's included" breakdown (makes $997 feel like a steal)
 * 5. Social proof elements (smart-triggered via engagement)
 * 6. Chat interface for questions
 * 7. Sticky CTA footer
 */

interface ProspectInfo {
  businessName: string;
  category: string;
  previewUrl: string;
  accentColor: string;
  city?: string;
  googleRating?: number;
  reviewCount?: number;
  currentWebsite?: string;
  pricingTier?: "standard" | "free";
  scrapedData?: {
    services?: { name: string; description?: string }[];
    testimonials?: { name: string; text: string }[];
  };
}

interface EngagementTriggers {
  showSocialProof: boolean;
  showUrgency: boolean;
  showCountdown: boolean;
}

interface Message {
  role: "agent" | "user";
  text: string;
}

export default function ClaimPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const prospectId = params.id as string;
  const [info, setInfo] = useState<ProspectInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [triggers, setTriggers] = useState<EngagementTriggers | undefined>(undefined);
  const [roiJobValue, setRoiJobValue] = useState(500);
  const [notFound, setNotFound] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const paymentCancelled = searchParams.get("payment") === "cancelled";

  useEffect(() => {
    // Fetch prospect data
    fetch(`/api/prospects/${prospectId}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        if (data.error) { setNotFound(true); return; }
        setInfo({
          businessName: data.businessName,
          category: data.category,
          previewUrl: data.generatedSiteUrl || `/preview/${prospectId}`,
          accentColor: "#0ea5e9",
          city: data.city,
          googleRating: data.googleRating,
          reviewCount: data.reviewCount,
          currentWebsite: data.currentWebsite,
          pricingTier: data.pricingTier || "standard",
          scrapedData: data.scrapedData,
        });

        if (paymentCancelled) {
          setMessages([
            {
              role: "agent",
              text: `Welcome back! Looks like you didn't finish checking out. No worries at all — your custom website for ${data.businessName} is still reserved.`,
            },
            {
              role: "agent",
              text: `Whenever you're ready, just let me know and I can take you back to the payment page. Or if you have any questions, I'm happy to help!`,
            },
          ]);
          setShowChat(true);
        } else {
          setMessages([
            {
              role: "agent",
              text: `Hey there! Welcome — I'm the BlueJays assistant. I see you're here about the website we built for ${data.businessName}. Pretty cool, right?`,
            },
            {
              role: "agent",
              text: `Before we get into details, have you had a chance to check out your preview site yet?`,
            },
          ]);
        }
      })
      .catch(() => {
        setMessages([
          {
            role: "agent",
            text: "Hey! Welcome to BlueJays. Looks like I'm having trouble loading your info. Could you tell me your business name?",
          },
        ]);
      });

    // Fetch engagement triggers for smart social proof
    fetch(`/api/engagement/${prospectId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          setTriggers(data.triggers);
        }
      })
      .catch(() => {});

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prospectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const redirectToCheckout = async () => {
    setIsRedirecting(true);
    setMessages((prev) => [
      ...prev,
      {
        role: "agent",
        text: "Taking you to our secure checkout page now...",
      },
    ]);

    try {
      const plan = new URLSearchParams(window.location.search).get("plan");
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectId, plan: plan || "full" }),
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "agent",
            text: "Hmm, something went wrong setting up checkout. Let me try again — or you can reach out to us directly at bluejaycontactme@gmail.com.",
          },
        ]);
        setIsRedirecting(false);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          text: "Sorry, I had trouble connecting to our payment system. Please try again in a moment or contact us at bluejaycontactme@gmail.com.",
        },
      ]);
      setIsRedirecting(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isRedirecting) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);

    setTimeout(() => {
      const result = getNextResponse(step, userMsg, info?.businessName || "your business", isFreeTier);
      setMessages((prev) => [
        ...prev,
        ...result.responses.map((text) => ({ role: "agent" as const, text })),
      ]);
      setStep((s) => s + 1);

      if (result.triggerCheckout) {
        setTimeout(() => redirectToCheckout(), 1500);
      }
    }, 800);
  };

  const categoryLabel = info?.category?.replace(/-/g, " ") || "business";
  const isFreeTier = info?.pricingTier === "free";
  const displayPrice = isFreeTier ? "$30" : "$997";

  // Value items for the "what you get" breakdown
  const valueItems = [
    { label: "Custom Website Design & Development", value: "$3,500", icon: "🎨" },
    { label: "Mobile-First Responsive Layout", value: "$800", icon: "📱" },
    { label: "SEO Optimization & Local Search Setup", value: "$1,200", icon: "🔍" },
    { label: "Professional Copywriting", value: "$600", icon: "✍️" },
    { label: "Hosting Setup & SSL Certificate", value: "$300", icon: "🔒" },
    { label: "1 Year of Site Management & Updates", value: "$1,200", icon: "🛠️" },
    { label: "Google Business Profile Optimization", value: "$400", icon: "📍" },
  ];

  const totalValue = "$8,000";

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#050a14] text-white flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">404</span>
          </div>
          <h1 className="text-2xl font-bold mb-3">Website Not Found</h1>
          <p className="text-white/50 mb-6">
            This preview link is no longer available or the website has already been claimed. If you think this is an error, please contact us.
          </p>
          <a
            href="https://bluejayportfolio.com"
            className="inline-block h-10 px-6 leading-10 rounded-full bg-sky-500 text-white text-sm font-medium hover:bg-sky-400 transition-colors"
          >
            Visit BlueJays Portfolio
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050a14] text-white">
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HERO SECTION */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <header className="border-b border-white/10 bg-[#050a14]/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-600" />
            <span className="font-bold text-lg">BlueJays</span>
          </div>
          {info && (
            <span className="text-white/40 text-sm hidden sm:block">
              Custom website for {info.businessName}
            </span>
          )}
          <button
            onClick={redirectToCheckout}
            disabled={isRedirecting}
            className="h-9 px-5 rounded-full bg-green-500 text-white text-sm font-bold hover:bg-green-400 transition-colors disabled:opacity-50"
          >
            {isRedirecting ? "Redirecting..." : `Claim — ${displayPrice}`}
          </button>
        </div>
      </header>

      {/* Payment Cancelled Banner */}
      {paymentCancelled && (
        <div className="bg-amber-500/10 border-b border-amber-500/20">
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
            <span className="text-sm text-amber-400">
              Checkout was cancelled — your site is still reserved
            </span>
            <button
              onClick={redirectToCheckout}
              disabled={isRedirecting}
              className="text-sm px-4 py-1.5 rounded-full bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              {isRedirecting ? "Redirecting..." : "Try Again"}
            </button>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sky-400 text-xs font-bold uppercase tracking-[0.25em] mb-4">
            {isFreeTier ? "Your Website Is Ready" : "Your Custom Website Is Ready"}
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            {info ? (
              <>Claim the website we built for <span className="text-sky-400">{info.businessName}</span></>
            ) : (
              <>Your new website is <span className="text-sky-400">ready</span></>
            )}
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto mb-8">
            {isFreeTier
              ? "Your website is ready! Just cover the setup costs to get started."
              : `A premium, mobile-optimized website designed specifically for your ${categoryLabel} business — ready to go live in 48 hours.`}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-2">
            <button
              onClick={redirectToCheckout}
              disabled={isRedirecting}
              className="h-14 px-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-bold hover:shadow-[0_0_40px_rgba(34,197,94,0.4)] transition-all duration-300 disabled:opacity-50"
            >
              {isRedirecting ? "Redirecting..." : `Claim Your Website — ${displayPrice}`}
            </button>
            {info?.previewUrl && (
              <a
                href={info.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-14 px-8 rounded-full border border-white/20 text-white/70 text-lg font-medium hover:border-white/40 hover:text-white transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview First
              </a>
            )}
            <a
              href="https://calendly.com/bluejaycontactme/website-walkthrough"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors text-sm font-medium"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Book a Free 15-Min Walkthrough
            </a>
          </div>
          {!isFreeTier && (
            <p className="text-center text-sm text-white/50 mb-6">
              Or{" "}
              <button
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("plan", "installment");
                  window.location.href = url.toString();
                }}
                className="underline hover:text-white/70 transition-colors"
              >
                3 easy payments of $349
              </button>
            </p>
          )}

          {/* Money-Back Guarantee Badge */}
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-5 py-2">
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-green-400 text-sm font-semibold">{isFreeTier ? "Setup covers domain registration & first year of hosting" : "100% Satisfaction Guarantee — Love it or get a full refund"}</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* BEFORE / AFTER VISUAL COMPARISON */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            See the <span className="text-sky-400">Transformation</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Before */}
            <div className="rounded-2xl border border-red-500/20 overflow-hidden">
              <div className="bg-red-500/10 px-5 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="font-bold text-sm">Before</span>
                </div>
                <span className="text-[10px] text-red-400 uppercase tracking-wider font-bold">Current</span>
              </div>
              <div className="aspect-[16/10] bg-[#0a0a0a] relative">
                {info?.currentWebsite ? (
                  <iframe
                    src={info.currentWebsite}
                    className="w-full h-full border-0 pointer-events-none"
                    sandbox="allow-scripts"
                    title="Current website"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center px-8">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-red-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    </div>
                    <p className="text-white/40 text-sm font-semibold mb-1">No Website</p>
                    <p className="text-white/25 text-xs">Potential customers can&apos;t find you online</p>
                  </div>
                )}
              </div>
            </div>

            {/* After */}
            <div className="rounded-2xl border border-green-500/20 overflow-hidden">
              <div className="bg-green-500/10 px-5 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="font-bold text-sm">After</span>
                </div>
                <span className="text-[10px] text-green-400 uppercase tracking-wider font-bold">Your New Site</span>
              </div>
              <div className="aspect-[16/10] bg-[#0a0a0a] relative">
                {info?.previewUrl ? (
                  <iframe
                    src={info.previewUrl}
                    className="w-full h-full border-0 pointer-events-none"
                    title="New website preview"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white/30 text-sm">
                    Loading preview...
                  </div>
                )}
              </div>
              <p className="text-xs text-white/30 mt-2 text-center">
                Preview images shown — we customize with your real business photos after purchase
              </p>
            </div>
          </div>

          {info?.currentWebsite && (
            <div className="text-center mt-4">
              <a
                href={`/compare/${prospectId}`}
                className="text-sky-400 hover:text-sky-300 text-sm font-medium transition-colors"
              >
                See detailed side-by-side comparison →
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TRUST BADGES */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <TrustBadge
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
              title="Secure Checkout"
              subtitle="256-bit SSL encryption"
            />
            <TrustBadge
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
              title="One-Time Payment"
              subtitle={isFreeTier ? "$30 setup + $100/yr after year one" : "$997 one-time + $100/yr after year one"}
            />
            <TrustBadge
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              title="Live in 48 Hours"
              subtitle="Fast turnaround guaranteed"
            />
            <TrustBadge
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
              title="Satisfaction Guarantee"
              subtitle="Full refund if you're not happy"
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* WHAT YOU GET — Value Breakdown */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2">
            Everything Included for <span className="text-sky-400">One Price</span>
          </h2>
          <p className="text-white/40 text-center mb-10">
            {isFreeTier
              ? "Everything you need to get online — included in your setup."
              : "Here's what agencies charge for each piece — and what you get with the $997 one-time fee."}
          </p>

          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {valueItems.map((item, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-6 py-4 ${i < valueItems.length - 1 ? "border-b border-white/5" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium text-white/80">{item.label}</span>
                </div>
                <span className="text-sm text-white/40 line-through">{item.value}</span>
              </div>
            ))}

            {/* Total */}
            <div className="bg-white/5 px-6 py-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-white/50">Total value if purchased separately</span>
                <span className="text-lg font-bold text-white/40 line-through">{totalValue}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-green-400">Your price today</span>
                <span className="text-3xl font-extrabold text-green-400">{displayPrice}</span>
              </div>
              <p className="text-xs text-white/30 mt-1">$997 one-time includes custom website design, domain registration, and hosting setup. After year one, $100/year maintenance covers domain renewal, hosting, ongoing maintenance, and support.</p>
            </div>
          </div>

          {/* CTA after value breakdown */}
          <div className="text-center mt-8">
            <button
              onClick={redirectToCheckout}
              disabled={isRedirecting}
              className="h-14 px-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-bold hover:shadow-[0_0_40px_rgba(34,197,94,0.4)] transition-all duration-300 disabled:opacity-50"
            >
              {isRedirecting ? "Redirecting..." : `Claim Your Website \u2014 ${displayPrice}`}
            </button>
            {!isFreeTier && (
              <p className="text-center text-sm text-white/50 mt-2">
                Or{" "}
                <button
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set("plan", "installment");
                    window.location.href = url.toString();
                  }}
                  className="underline hover:text-white/70 transition-colors"
                >
                  3 easy payments of $349
                </button>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ROI CALCULATOR */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {!isFreeTier && (
        <section className="py-12 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-center mb-2">
                See How Fast It <span className="text-green-400">Pays for Itself</span>
              </h3>
              <p className="text-white/40 text-sm text-center mb-6">
                Your website works 24/7 bringing in new customers
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-1 w-full">
                  <label className="text-sm text-white/60 mb-2 block">
                    What&apos;s your average job/sale worth?
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg">$</span>
                    <input
                      type="number"
                      value={roiJobValue}
                      onChange={(e) => setRoiJobValue(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full h-12 pl-8 pr-4 rounded-xl bg-white/5 border border-white/10 text-white text-lg placeholder:text-white/25 focus:border-green-500/50 focus:outline-none transition-colors"
                      min={1}
                    />
                  </div>
                </div>

                <div className="flex-1 w-full bg-green-500/10 border border-green-500/20 rounded-xl p-5 text-center">
                  <p className="text-green-400 text-2xl font-extrabold mb-1">
                    {Math.ceil(997 / roiJobValue)} new customer{Math.ceil(997 / roiJobValue) !== 1 ? "s" : ""}
                  </p>
                  <p className="text-white/50 text-sm">
                    At $997, you need just <span className="text-green-400 font-bold">{Math.ceil(997 / roiJobValue)}</span> new customer{Math.ceil(997 / roiJobValue) !== 1 ? "s" : ""} to pay for your entire website
                  </p>
                </div>
              </div>

              <p className="text-white/30 text-xs text-center mt-4 flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                Most of our clients see their first website lead within 2 weeks
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* WHY NOT DIY? — Comparison Table */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {!isFreeTier && (
        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-2">
              Why <span className="text-sky-400">BlueJays</span>?
            </h2>
            <p className="text-white/40 text-center text-sm mb-8">
              See how we compare to other options
            </p>

            <div className="relative overflow-x-auto">
              {/* Scroll hint gradient on mobile */}
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0f1a] to-transparent sm:hidden z-10" />
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-white/50 font-medium">Feature</th>
                    <th className="text-center py-3 px-4 text-green-400 font-bold">BlueJays</th>
                    <th className="text-center py-3 px-4 text-white/50 font-medium">Wix / Squarespace</th>
                    <th className="text-center py-3 px-4 text-white/50 font-medium">Hiring an Agency</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Price", bj: "$997 one-time", wix: "$16-45/mo forever", agency: "$5,000-15,000" },
                    { feature: "Ready in", bj: "48 hours", wix: "Weeks (you build it)", agency: "4-8 weeks" },
                    { feature: "Custom design", bjCheck: true, wixX: true, agencyCheck: true, bj: "Built for you", wix: "Template you customize", agency: "Custom" },
                    { feature: "Mobile optimized", bjCheck: true, wixMaybe: true, agencyCheck: true, bj: "Included", wix: "Depends on template", agency: "Usually" },
                    { feature: "SEO built in", bjCheck: true, wixX: true, agencyCheck: true, bj: "Included", wix: "Extra plugins needed", agency: "Usually extra" },
                    { feature: "Professional copy", bjCheck: true, wixX: true, agencyCheck: true, bj: "Written for you", wix: "You write it", agency: "Usually extra" },
                    { feature: "Ongoing cost", bj: "$0/month", wix: "$16-45/month", agency: "$100-500/month" },
                    { feature: "You do the work", bjX: true, wixYou: true, agencyX: true, bj: "We handle everything", wix: "All on you", agency: "They handle it" },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 text-white/70 font-medium">{row.feature}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          {row.bjCheck && <span className="text-green-400 text-base">&#10003;</span>}
                          {row.bjX && <span className="text-green-400 text-base">&#10007;</span>}
                          <span className="text-green-400 text-xs font-medium">{row.bj}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          {row.wixX && <span className="text-red-400 text-base">&#10007;</span>}
                          {row.wixYou && <span className="text-red-400 text-base">&#10003;</span>}
                          {row.wixMaybe && <span className="text-amber-400 text-base">~</span>}
                          <span className="text-white/40 text-xs">{row.wix}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          {row.agencyCheck && <span className="text-white/40 text-base">&#10003;</span>}
                          {row.agencyX && <span className="text-white/40 text-base">&#10007;</span>}
                          <span className="text-white/40 text-xs">{row.agency}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* MONEY-BACK GUARANTEE — Detailed */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-green-400 mb-3">
              100% Satisfaction or We Rebuild It Free
            </h3>
            <p className="text-white/60 text-sm leading-relaxed max-w-xl mx-auto mb-4">
              If you&apos;re not completely happy with your website, we&apos;ll redesign it at no extra charge. No questions asked.
            </p>
            <p className="text-white/40 text-xs">
              That&apos;s how sure we are that this website will help {info?.businessName || "your business"} grow.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* GOOGLE REVIEWS SOCIAL PROOF (if prospect has reviews) */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {info?.googleRating && info?.reviewCount && info.reviewCount > 3 && (
        <section className="py-8 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${i < Math.round(info.googleRating!) ? "text-amber-400" : "text-white/10"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-amber-400 font-bold text-lg mb-1">
                {info.googleRating} stars across {info.reviewCount} Google reviews
              </p>
              <p className="text-white/40 text-sm">
                Your new website prominently displays these reviews to build instant trust with visitors.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SMART SOCIAL PROOF — Engagement-Gated */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-4 px-6">
        <div className="max-w-3xl mx-auto">
          <SmartSocialProof
            prospectId={prospectId}
            city={info?.city}
            category={info?.category}
            triggers={triggers}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* WHAT HAPPENS NEXT — Process Steps */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">
            What Happens After You <span className="text-sky-400">Claim</span>
          </h2>
          <div className="space-y-6">
            <ProcessStep
              number={1}
              title="Secure Checkout"
              description="Quick, secure payment through Stripe. Takes about 2 minutes."
            />
            <ProcessStep
              number={2}
              title="Customization Form"
              description="Tell us exactly what you want changed — colors, photos, content, layout. We'll make it yours."
            />
            <ProcessStep
              number={3}
              title="We Build & Refine"
              description="Our team implements your changes and optimizes everything for performance."
            />
            <ProcessStep
              number={4}
              title="Your Site Goes Live"
              description="Within 48 hours, your new website is live and ready to bring in customers."
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* POST-PURCHASE TIMELINE */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2">
            What to <span className="text-sky-400">Expect</span> After Purchase
          </h2>
          <p className="text-white/40 text-center text-sm mb-10">
            From purchase to live website in just 7 days
          </p>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-green-500/50 via-sky-500/50 to-sky-500/20" />

            <div className="space-y-8">
              {[
                { day: "Day 1", title: "You Purchase", description: "Instant access to your preview site. Your website is officially reserved and in our build queue.", color: "from-green-500 to-emerald-600" },
                { day: "Day 2", title: "Onboarding Form", description: "Tell us your preferences, upload your real business photos, and share any changes you want.", color: "from-sky-500 to-blue-600" },
                { day: "Day 3-5", title: "We Customize", description: "Our team adds your real photos, applies your brand colors, and refines all the copy to match your voice.", color: "from-sky-500 to-blue-600" },
                { day: "Day 7", title: "Go Live", description: "Your website is connected to your domain and ready for customers. Start getting leads immediately.", color: "from-green-500 to-emerald-600" },
              ].map((step, i) => (
                <div key={i} className="flex gap-5 items-start">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shrink-0 relative z-10 shadow-lg`}>
                    <span className="text-white font-bold text-sm">{i + 1}</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-xs text-sky-400 font-bold uppercase tracking-wider">{step.day}</span>
                    <h3 className="font-bold text-white mt-0.5 mb-1">{step.title}</h3>
                    <p className="text-white/40 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FAQ Section */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Common Questions</h2>
          <div className="space-y-3">
            <FaqItem
              question="Can I make changes to the design?"
              answer="Absolutely! The preview is just a starting point. After you claim, you'll fill out a customization form where you can request any changes — colors, photos, layout, content, features. We'll make it exactly how you want it."
            />
            <FaqItem
              question="Do I own the website?"
              answer="Yes, 100%. Once you pay, the website is yours. The $997 one-time fee includes custom website design, domain registration, and hosting setup, and after year one the $100/year maintenance plan keeps your domain renewed, hosting active, and support available. You still own the content and design."
            />
            <FaqItem
              question="What if I already have a website?"
              answer="Great! We can either replace your current site or set up the new one alongside it. Many of our clients upgrade from older sites that aren't mobile-friendly or SEO-optimized."
            />
            <FaqItem
              question="Is there a monthly fee?"
              answer="There is no monthly fee. The website is $997 one-time, which includes custom website design, domain registration, and hosting setup. After year one, it's $100/year for maintenance, which covers domain renewal, hosting, ongoing maintenance, and support. That's it — no hidden costs."
            />
            <FaqItem
              question="What if I'm not satisfied?"
              answer="We offer a 100% satisfaction guarantee. If you're not happy with the final product, we'll refund your money. No questions asked."
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* CHAT INTERFACE — Expandable */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {showChat ? (
        <section className="py-8 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between">
                <span className="font-bold text-sm">Chat with BlueJays</span>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-white/30 hover:text-white/60 text-sm"
                >
                  Minimize
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto px-6 py-4 space-y-3">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-sky-500 text-white rounded-br-sm"
                          : "bg-white/10 rounded-bl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              {step === 0 && !paymentCancelled && (
                <div className="px-6 py-2 border-t border-white/5 flex gap-2 overflow-x-auto">
                  {["Yes, I love it!", "I have questions", "How much?", "Not interested"].map(
                    (option) => (
                      <button
                        key={option}
                        disabled={isRedirecting}
                        onClick={() => {
                          setInput(option);
                          setTimeout(() => {
                            setMessages((prev) => [
                              ...prev,
                              { role: "user", text: option },
                            ]);
                            const result = getNextResponse(0, option, info?.businessName || "your business", isFreeTier);
                            setTimeout(() => {
                              setMessages((prev) => [
                                ...prev,
                                ...result.responses.map((text) => ({
                                  role: "agent" as const,
                                  text,
                                })),
                              ]);
                              setStep(1);
                              if (result.triggerCheckout) {
                                setTimeout(() => redirectToCheckout(), 1500);
                              }
                            }, 800);
                          }, 100);
                        }}
                        className="shrink-0 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/50 hover:text-white hover:border-sky-400/40 transition-colors disabled:opacity-50"
                      >
                        {option}
                      </button>
                    )
                  )}
                </div>
              )}

              {/* Input */}
              <div className="px-6 py-3 border-t border-white/10">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    disabled={isRedirecting}
                    className="flex-1 h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isRedirecting}
                    className="h-10 px-5 rounded-xl bg-sky-500 text-white text-sm font-medium disabled:opacity-30 hover:bg-sky-400 transition-colors"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="py-8 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <button
              onClick={() => setShowChat(true)}
              className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 font-medium text-sm transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Have questions? Chat with us
            </button>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FINAL CTA */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold mb-4">
            Ready to grow {info?.businessName || "your business"} online?
          </h2>
          <p className="text-white/40 mb-8 max-w-xl mx-auto">
            Your custom website is built, tested, and ready to go live. All that&apos;s left is for you to claim it.
          </p>
          <button
            onClick={redirectToCheckout}
            disabled={isRedirecting}
            className="h-16 px-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl font-bold hover:shadow-[0_0_60px_rgba(34,197,94,0.4)] transition-all duration-300 disabled:opacity-50"
          >
            {isRedirecting ? "Redirecting..." : `Claim Your Website \u2014 ${displayPrice}`}
          </button>
          {!isFreeTier && (
            <p className="text-center text-sm text-white/50 mt-2">
              Or{" "}
              <button
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("plan", "installment");
                  window.location.href = url.toString();
                }}
                className="underline hover:text-white/70 transition-colors"
              >
                3 easy payments of $349
              </button>
            </p>
          )}
          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-white/30">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M5 13l4 4L19 7" /></svg>
              One-time setup payment
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M5 13l4 4L19 7" /></svg>
              Live in 48 hours
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M5 13l4 4L19 7" /></svg>
              Satisfaction guaranteed
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto text-center text-xs text-white/20">
          <p>BlueJays Web Design — Custom websites for local businesses</p>
          <p className="mt-1">Questions? Email us at bluejaycontactme@gmail.com</p>
          <p className="mt-2 text-white/15">{isFreeTier ? "$30" : "$997"} {isFreeTier ? "covers domain registration and server setup costs." : "one-time includes custom website design, domain registration, and hosting setup."} After the first year, a $100/year maintenance fee covers domain renewal, hosting, ongoing maintenance, and support. You may cancel anytime.</p>
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

function TrustBadge({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
      <div className="text-green-400 flex justify-center mb-2">{icon}</div>
      <p className="text-xs font-bold text-white/80 mb-0.5">{title}</p>
      <p className="text-[10px] text-white/30">{subtitle}</p>
    </div>
  );
}

function ProcessStep({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
        <span className="text-sky-400 font-bold text-sm">{number}</span>
      </div>
      <div>
        <h3 className="font-bold text-sm mb-1">{title}</h3>
        <p className="text-white/40 text-sm">{description}</p>
      </div>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="bg-white/5 border border-white/10 rounded-xl overflow-hidden cursor-pointer"
      onClick={() => setOpen(!open)}
    >
      <div className="px-5 py-3.5 flex items-center justify-between">
        <span className="text-sm font-medium text-white/80">{question}</span>
        <svg
          className={`w-4 h-4 text-white/30 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {open && (
        <div className="px-5 pb-4 text-sm text-white/50 border-t border-white/5 pt-3">
          {answer}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CHAT RESPONSE LOGIC
// ═══════════════════════════════════════════════════════════════

interface ResponseResult {
  responses: string[];
  triggerCheckout: boolean;
}

function getNextResponse(step: number, userMessage: string, businessName: string, isFreeTier: boolean = false): ResponseResult {
  const lower = userMessage.toLowerCase();

  if (
    lower.includes("ready") || lower.includes("claim") || lower.includes("get started") ||
    lower.includes("let's do it") || lower.includes("sign up") || lower.includes("proceed") ||
    lower.includes("move forward") || lower.includes("try again")
  ) {
    return {
      responses: [
        `Let's do it! I'll take you to our secure checkout page now. You'll be set up in just a couple minutes.`,
      ],
      triggerCheckout: true,
    };
  }

  if (lower.includes("love") || lower.includes("amazing") || lower.includes("great") || lower.includes("yes")) {
    return {
      responses: [
        `Awesome, so glad you like it! The site is fully custom — built specifically for ${businessName}.`,
        `Here's what's included: the $997 one-time fee covers custom website design, domain registration, and hosting setup. After year one, maintenance is $100/year for domain renewal, hosting, ongoing maintenance, and support.`,
        isFreeTier
          ? `The total is just $30 one-time to cover setup costs. After year one, maintenance is $100/year. Ready to claim it? Just click the green button!`
          : `The total is $997 one-time, and that includes custom website design, domain registration, and hosting setup. After year one, maintenance is just $100/year for domain renewal, hosting, ongoing maintenance, and support. Ready to claim it? Just click the green button!`,
      ],
      triggerCheckout: false,
    };
  }

  if (lower.includes("cost") || lower.includes("price") || lower.includes("how much") || lower.includes("pricing")) {
    return {
      responses: [
        isFreeTier
          ? `Great question! It's just $30 one-time — that covers domain registration and server setup costs.`
          : `Great question! It's $997 one-time — that includes custom website design, domain registration, and hosting setup.`,
        `After year one, there's a $100/year maintenance fee for domain renewal, hosting, ongoing maintenance, and support. You can cancel anytime — no contracts.`,
        ...(isFreeTier ? [] : [`For context, agencies charge $3,000-$10,000+ for this. And you've already seen the actual site we built — no guesswork. Would you like to move forward?`]),
      ],
      triggerCheckout: false,
    };
  }

  if (lower.includes("question") || lower.includes("wondering") || lower.includes("curious")) {
    return {
      responses: [
        `Of course! I'm here to help. What would you like to know? Common questions:`,
        `• Can I make changes to the design?\n• What's included in the price?\n• How long until it's live?\n• Do I own the website?\n• What about hosting and domain?\n\nFeel free to ask anything!`,
      ],
      triggerCheckout: false,
    };
  }

  if (lower.includes("not interested") || lower.includes("no thanks") || lower.includes("pass")) {
    return {
      responses: [
        `No worries at all! The preview will stay up if you change your mind. Wishing you and ${businessName} all the best!`,
      ],
      triggerCheckout: false,
    };
  }

  if (lower.includes("change") || lower.includes("custom") || lower.includes("modify") || lower.includes("different")) {
    return {
      responses: [
        `Absolutely! The preview is just a starting point. Once you claim it, we'll customize everything — colors, content, photos, layout — whatever you need.`,
        `You'll fill out a quick form telling us what you want changed, and we'll make it happen before going live. Want to get started?`,
      ],
      triggerCheckout: false,
    };
  }

  if (lower.includes("domain") || lower.includes("hosting") || lower.includes("url")) {
    return {
      responses: [
        `We handle all the technical stuff! The $997 one-time fee includes domain registration if you need one, plus hosting setup. If you already have a domain, we'll connect it for you.`,
        `Hosting is included in the setup, and after year one the $100/year maintenance plan keeps your hosting active, your domain renewed, and your support covered.`,
      ],
      triggerCheckout: false,
    };
  }

  if (lower.includes("guarantee") || lower.includes("refund") || lower.includes("money back")) {
    return {
      responses: [
        `We offer a 100% satisfaction guarantee. If you're not happy with the final product after we implement your customizations, we'll refund your money — no questions asked.`,
        `We're that confident you'll love it. Ready to get started?`,
      ],
      triggerCheckout: false,
    };
  }

  if (step <= 1) {
    return {
      responses: [
        `Thanks for your interest! The website for ${businessName} is ready to go live whenever you are.`,
        `Would you like to know more about what's included, the pricing, or are you ready to claim your site?`,
      ],
      triggerCheckout: false,
    };
  }

  return {
    responses: [
      `Thanks for sharing that! Is there anything specific about the website or the process you'd like to know more about?`,
    ],
    triggerCheckout: false,
  };
}
