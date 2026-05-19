"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle, Warning } from "@phosphor-icons/react";

/**
 * Mt View customer-facing estimate request form — editorial restyle.
 *
 * v4 redesign (2026-05-19): no card chrome, no surrounding box. Inputs
 * are bare with a thin Stone bottom-border that thickens to Moss on
 * focus. The submit button is the ONLY filled button on the entire
 * site — Bark color, the visual exclamation point.
 *
 * Posts to /api/clients/mt-view-landscaping/contact which forwards to
 * the Hunsakers' gmail + CCs info@mountainviewlandscape.com.
 */
export default function MtViewContactForm({
  services,
}: {
  services: string[];
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [errMsg, setErrMsg] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrMsg("");

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      property_address: String(fd.get("property_address") || "").trim(),
      service: String(fd.get("service") || "").trim(),
      preferred_contact: String(fd.get("preferred_contact") || "").trim(),
      message: String(fd.get("message") || "").trim(),
    };

    if (!payload.name) {
      setStatus("err");
      setErrMsg("Please tell us your name.");
      return;
    }
    if (!payload.email && !payload.phone) {
      setStatus("err");
      setErrMsg("Please leave an email or phone number so we can reach you.");
      return;
    }
    if (!payload.message) {
      setStatus("err");
      setErrMsg("A few words about your project helps us prepare.");
      return;
    }

    try {
      const res = await fetch("/api/clients/mt-view-landscaping/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setStatus("err");
        setErrMsg(data.error || "Something went wrong. Please try again or call us.");
        return;
      }
      setStatus("ok");
    } catch {
      setStatus("err");
      setErrMsg("Network error — please try again or call us directly.");
    }
  }

  if (status === "ok") {
    return (
      <div className="bg-[#FBF8F1] border-l-2 border-[#3E4A36] px-8 py-12 sm:px-12 sm:py-16">
        <CheckCircle size={36} weight="duotone" className="text-[#3E4A36] mb-6" />
        <h3 className="font-[family-name:var(--font-fraunces)] font-light text-[34px] sm:text-[44px] text-[#1C1F1A] tracking-tight leading-[1.05] mb-4">
          Thanks — we&rsquo;ve got it.
        </h3>
        <p className="font-[family-name:var(--font-inter)] text-[17px] leading-[1.65] text-[#1C1F1A]/70 max-w-md">
          A note just landed in our inbox. We typically respond within 24 hours
          and will reach out by your preferred method to set up a site visit.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
        <Field label="Your name" name="name" required autoComplete="name" />
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
        />
        <Field
          label="Phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="(253) 555-0100"
        />
        <Field
          label="Property address"
          name="property_address"
          autoComplete="street-address"
          placeholder="Where is the work?"
        />

        <Select
          label="Service"
          name="service"
          options={["Not sure yet", ...services]}
        />
        <Select
          label="Preferred contact"
          name="preferred_contact"
          options={["Either", "Email", "Phone call", "Text message"]}
        />

        <div className="sm:col-span-2">
          <Textarea
            label="Tell us about your project"
            name="message"
            required
            placeholder="Yard size, what you're hoping to do, any timeline you have in mind."
          />
        </div>
      </div>

      {status === "err" && (
        <div className="flex items-start gap-3 font-[family-name:var(--font-inter)] text-[14px] text-[#6B5A3E] border-l-2 border-[#6B5A3E] pl-4 py-2">
          <Warning size={18} weight="duotone" className="mt-0.5 shrink-0" />
          <span>{errMsg}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-6 pt-4">
        <p className="font-[family-name:var(--font-inter)] text-[12px] text-[#A8A294] max-w-xs">
          Free estimate. No obligation. We typically respond within 24 hours.
        </p>
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center gap-2 bg-[#6B5A3E] hover:bg-[#1C1F1A] text-[#F5F1E8] px-9 py-4 font-[family-name:var(--font-inter)] text-[13px] font-medium tracking-[0.08em] uppercase transition-colors duration-200 disabled:opacity-60 disabled:cursor-wait"
        >
          {status === "sending" ? "Sending…" : "Send to Mt View"}
          {status !== "sending" && <ArrowRight size={15} weight="bold" />}
        </button>
      </div>
    </form>
  );
}

/** Bare-input field with thin Stone bottom-border that thickens to Moss on focus. */
function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block group">
      <span className="block font-[family-name:var(--font-inter)] text-[10px] tracking-[0.22em] uppercase text-[#A8A294] mb-3 transition-colors group-focus-within:text-[#3E4A36]">
        {label}
        {required && <span className="text-[#6B5A3E] ml-1">*</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full bg-transparent border-0 border-b border-[#A8A294]/40 focus:border-[#3E4A36] focus:border-b-2 outline-none pb-2 font-[family-name:var(--font-inter)] text-[16px] text-[#1C1F1A] placeholder:text-[#1C1F1A]/30 transition-all"
      />
    </label>
  );
}

function Select({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  return (
    <label className="block group">
      <span className="block font-[family-name:var(--font-inter)] text-[10px] tracking-[0.22em] uppercase text-[#A8A294] mb-3 transition-colors group-focus-within:text-[#3E4A36]">
        {label}
      </span>
      <select
        name={name}
        defaultValue={options[0]}
        className="w-full bg-transparent border-0 border-b border-[#A8A294]/40 focus:border-[#3E4A36] focus:border-b-2 outline-none pb-2 font-[family-name:var(--font-inter)] text-[16px] text-[#1C1F1A]"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function Textarea({
  label,
  name,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block group">
      <span className="block font-[family-name:var(--font-inter)] text-[10px] tracking-[0.22em] uppercase text-[#A8A294] mb-3 transition-colors group-focus-within:text-[#3E4A36]">
        {label}
        {required && <span className="text-[#6B5A3E] ml-1">*</span>}
      </span>
      <textarea
        name={name}
        required={required}
        placeholder={placeholder}
        rows={5}
        className="w-full bg-transparent border-0 border-b border-[#A8A294]/40 focus:border-[#3E4A36] focus:border-b-2 outline-none pb-2 font-[family-name:var(--font-inter)] text-[16px] text-[#1C1F1A] placeholder:text-[#1C1F1A]/30 transition-all resize-y"
      />
    </label>
  );
}
