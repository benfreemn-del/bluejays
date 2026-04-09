"use client";

import { useState } from "react";
import { CATEGORY_CONFIG, type Category } from "@/lib/types";

const categoryOptions: { value: Category; label: string }[] = (
  Object.keys(CATEGORY_CONFIG) as Category[]
).map((key) => ({ value: key, label: CATEGORY_CONFIG[key].label }));

export default function GetStartedPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    phone: "",
    email: "",
    website: "",
    category: "" as string,
    city: "",
    state: "",
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.businessName.trim()) { setError("Please enter your business name."); return; }
    if (!form.phone.trim()) { setError("Please enter your phone number."); return; }
    if (form.phone.replace(/\D/g, "").length < 10) { setError("Please enter a valid phone number."); return; }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError("Please enter a valid email address."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/leads/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong");
      }
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ─── Success State ─── */
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#050a14] flex items-center justify-center p-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-sky-500/10 blur-[150px]" />
        </div>
        <div className="relative z-10 max-w-lg text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 mx-auto mb-6 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-10 h-10">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-white">You&apos;re In!</h1>
          <p className="text-white/50 text-lg mb-6 leading-relaxed">
            We&apos;re building your custom website right now. You&apos;ll receive a preview link within <span className="text-white font-semibold">48 hours</span> — completely free, no strings attached.
          </p>
          <p className="text-white/30 text-sm">
            We&apos;ll text you at <span className="text-white/50 font-medium">{form.phone}</span> when it&apos;s ready.
          </p>
          <a href="/" className="inline-flex items-center gap-2 mt-8 text-sky-400 text-sm hover:underline transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to BlueJays
          </a>
        </div>
      </div>
    );
  }

  /* ─── Form ─── */
  const inputCls =
    "w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/25 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 focus:outline-none transition-all text-[16px]";
  const labelCls = "block text-sm font-medium text-white/70 mb-1.5";

  return (
    <div className="min-h-screen bg-[#050a14] text-white">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-sky-500/[0.07] blur-[180px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-blue-600/[0.05] blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-5 py-10 md:py-16">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <a href="/" className="inline-flex items-center gap-2.5 mb-6 md:mb-8 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 group-hover:shadow-[0_0_20px_rgba(14,165,233,0.4)] transition-shadow" />
            <span className="text-xl font-bold text-white">BlueJays</span>
          </a>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 leading-tight">
            Get a Free Custom <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">Website Preview</span> for Your Business
          </h1>
          <p className="text-white/45 text-base md:text-lg leading-relaxed max-w-md mx-auto">
            Tell us about your business and we&apos;ll design a stunning website — completely free. See it before you pay anything.
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-8 text-xs text-white/35">
          <span className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-emerald-400">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            100% Free Preview
          </span>
          <span className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-emerald-400">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            No Credit Card
          </span>
          <span className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-emerald-400">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Ready in 48 Hours
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Business Name */}
          <div>
            <label className={labelCls}>Business Name <span className="text-sky-400">*</span></label>
            <input
              type="text"
              required
              value={form.businessName}
              onChange={set("businessName")}
              placeholder="e.g., Bright Smile Dental"
              className={inputCls}
            />
          </div>

          {/* Owner Name + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Your Name <span className="text-white/30">(optional)</span></label>
              <input
                type="text"
                value={form.ownerName}
                onChange={set("ownerName")}
                placeholder="First & last name"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Phone Number <span className="text-sky-400">*</span></label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={set("phone")}
                placeholder="(206) 555-1234"
                className={inputCls}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={labelCls}>Email <span className="text-white/30">(optional)</span></label>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@business.com"
              className={inputCls}
            />
          </div>

          {/* Business Type / Category dropdown */}
          <div>
            <label className={labelCls}>Business Type / Category</label>
            <select
              value={form.category}
              onChange={set("category")}
              className={`${inputCls} appearance-none bg-[length:16px] bg-[right_16px_center] bg-no-repeat`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff40' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              }}
            >
              <option value="" className="bg-[#0a1628] text-white/50">Select your industry...</option>
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#0a1628] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* City + State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>City</label>
              <input
                type="text"
                value={form.city}
                onChange={set("city")}
                placeholder="e.g., Seattle"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>State</label>
              <select
                value={form.state}
                onChange={set("state")}
                className={`${inputCls} appearance-none bg-[length:16px] bg-[right_16px_center] bg-no-repeat`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff40' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                }}
              >
                <option value="" className="bg-[#0a1628] text-white/50">Select state...</option>
                {US_STATES.map((s) => (
                  <option key={s.abbr} value={s.abbr} className="bg-[#0a1628] text-white">{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Website URL */}
          <div>
            <label className={labelCls}>
              Current Website <span className="text-white/30">(optional)</span>
            </label>
            <input
              type="url"
              value={form.website}
              onChange={set("website")}
              placeholder="Enter your current site or leave blank if you don't have one"
              className={inputCls}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-lg disabled:opacity-50 hover:shadow-[0_0_40px_rgba(14,165,233,0.4)] active:scale-[0.98] transition-all duration-300 mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                </svg>
                Building Your Website...
              </span>
            ) : (
              "Build My Free Website"
            )}
          </button>

          <p className="text-center text-white/25 text-xs pt-1">
            100% free preview. No credit card. No obligation. Delivered within 48 hours.
          </p>
        </form>
      </div>
    </div>
  );
}

/* ─── US States ─── */
const US_STATES = [
  { abbr: "AL", name: "Alabama" }, { abbr: "AK", name: "Alaska" }, { abbr: "AZ", name: "Arizona" },
  { abbr: "AR", name: "Arkansas" }, { abbr: "CA", name: "California" }, { abbr: "CO", name: "Colorado" },
  { abbr: "CT", name: "Connecticut" }, { abbr: "DE", name: "Delaware" }, { abbr: "FL", name: "Florida" },
  { abbr: "GA", name: "Georgia" }, { abbr: "HI", name: "Hawaii" }, { abbr: "ID", name: "Idaho" },
  { abbr: "IL", name: "Illinois" }, { abbr: "IN", name: "Indiana" }, { abbr: "IA", name: "Iowa" },
  { abbr: "KS", name: "Kansas" }, { abbr: "KY", name: "Kentucky" }, { abbr: "LA", name: "Louisiana" },
  { abbr: "ME", name: "Maine" }, { abbr: "MD", name: "Maryland" }, { abbr: "MA", name: "Massachusetts" },
  { abbr: "MI", name: "Michigan" }, { abbr: "MN", name: "Minnesota" }, { abbr: "MS", name: "Mississippi" },
  { abbr: "MO", name: "Missouri" }, { abbr: "MT", name: "Montana" }, { abbr: "NE", name: "Nebraska" },
  { abbr: "NV", name: "Nevada" }, { abbr: "NH", name: "New Hampshire" }, { abbr: "NJ", name: "New Jersey" },
  { abbr: "NM", name: "New Mexico" }, { abbr: "NY", name: "New York" }, { abbr: "NC", name: "North Carolina" },
  { abbr: "ND", name: "North Dakota" }, { abbr: "OH", name: "Ohio" }, { abbr: "OK", name: "Oklahoma" },
  { abbr: "OR", name: "Oregon" }, { abbr: "PA", name: "Pennsylvania" }, { abbr: "RI", name: "Rhode Island" },
  { abbr: "SC", name: "South Carolina" }, { abbr: "SD", name: "South Dakota" }, { abbr: "TN", name: "Tennessee" },
  { abbr: "TX", name: "Texas" }, { abbr: "UT", name: "Utah" }, { abbr: "VT", name: "Vermont" },
  { abbr: "VA", name: "Virginia" }, { abbr: "WA", name: "Washington" }, { abbr: "WV", name: "West Virginia" },
  { abbr: "WI", name: "Wisconsin" }, { abbr: "WY", name: "Wyoming" }, { abbr: "DC", name: "Washington DC" },
];
