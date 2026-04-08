"use client";

import { useState } from "react";

export default function GetStartedPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    phone: "",
    email: "",
    website: "",
    category: "",
    city: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName || !form.phone) return;
    setLoading(true);
    try {
      await fetch("/api/leads/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#050a14] flex items-center justify-center p-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-sky-500/10 blur-[150px]" />
        </div>
        <div className="relative z-10 max-w-lg text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 mx-auto mb-6 flex items-center justify-center text-3xl">
            🎉
          </div>
          <h1 className="text-3xl font-extrabold mb-4">You&apos;re In!</h1>
          <p className="text-white/50 text-lg mb-6">
            We&apos;re building your custom website right now. You&apos;ll receive a preview link within 48 hours — completely free, no strings attached.
          </p>
          <p className="text-white/30 text-sm">
            We&apos;ll text you at {form.phone} when it&apos;s ready.
          </p>
          <a href="/" className="inline-block mt-8 text-sky-400 text-sm hover:underline">
            &larr; Back to BlueJays
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050a14]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-sky-500/8 blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <a href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600" />
            <span className="text-xl font-bold text-white">BlueJays</span>
          </a>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Get Your <span className="text-sky-400">Free Website</span>
          </h1>
          <p className="text-white/50 text-lg">
            Tell us about your business and we&apos;ll build you a stunning website — completely free. See it before you pay anything.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Business Name *</label>
            <input
              type="text"
              required
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              placeholder="e.g., Bright Smile Dental"
              className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/30 focus:border-sky-500/50 focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Your Name</label>
              <input
                type="text"
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                placeholder="First & last"
                className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/30 focus:border-sky-500/50 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Phone *</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(206) 555-1234"
                className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/30 focus:border-sky-500/50 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@business.com"
              className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/30 focus:border-sky-500/50 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Current Website (if any)</label>
            <input
              type="url"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://yourbusiness.com"
              className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/30 focus:border-sky-500/50 focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Industry</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g., Plumbing, Dental, Landscaping"
                className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/30 focus:border-sky-500/50 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Seattle, WA"
                className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/30 focus:border-sky-500/50 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !form.businessName || !form.phone}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-lg disabled:opacity-50 hover:shadow-[0_0_40px_rgba(14,165,233,0.4)] transition-all duration-300"
          >
            {loading ? "Submitting..." : "Build My Free Website"}
          </button>

          <p className="text-center text-white/30 text-xs">
            100% free preview. No credit card. No obligation. Delivered within 48 hours.
          </p>
        </form>
      </div>
    </div>
  );
}
