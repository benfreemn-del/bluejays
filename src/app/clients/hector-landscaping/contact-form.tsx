"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle, Warning } from "@phosphor-icons/react";

/**
 * Hector Landscaping customer-facing estimate request form.
 *
 * Posts to /api/clients/inquire which forwards to
 * Hector Landscaping (mtviewlandscapeonline@gmail.com) and pings Ben so he can
 * verify deliverability.
 */
export default function HectorLandscapingContactForm({
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
      slug: "hector-landscaping",
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
      const res = await fetch("/api/clients/inquire", {
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
      <div className="bg-white border border-[#1a2e1a]/15 p-10 sm:p-12">
        <CheckCircle size={40} weight="duotone" className="text-[#1a2e1a] mb-5" />
        <h3 className="font-serif text-[28px] sm:text-[32px] text-[#1a1612] tracking-tight mb-3">
          Thanks &mdash; we&rsquo;ve got it.
        </h3>
        <p className="text-[16px] leading-relaxed text-[#1a1612]/75 max-w-md">
          A note just landed in our inbox. We typically respond within 24 hours
          and will reach out by your preferred method to set up an estimate.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-[#1a2e1a]/15 p-7 sm:p-10"
      noValidate
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

        <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Select label="Service" name="service" options={["Not sure yet", ...services]} />
          <Select
            label="Preferred contact"
            name="preferred_contact"
            options={["Either", "Email", "Phone call", "Text message"]}
          />
        </div>

        <div className="sm:col-span-2">
          <Textarea
            label="Tell us about your project"
            name="message"
            required
            placeholder="Yard size, what you&rsquo;re hoping to do, any timeline you have in mind."
          />
        </div>
      </div>

      {status === "err" && (
        <div className="mt-5 flex items-start gap-2 text-[14px] text-[#7a1f1f] bg-[#fbeaea] border border-[#7a1f1f]/15 px-4 py-3">
          <Warning size={18} weight="fill" className="mt-0.5 shrink-0" />
          <span>{errMsg}</span>
        </div>
      )}

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
        <p className="text-[12px] text-[#1a1612]/55 max-w-xs">
          Free estimate. No obligation. We typically respond within 24 hours.
        </p>
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center gap-2 bg-[#1a2e1a] text-[#f8f5ef] px-7 py-3.5 text-[14px] font-medium tracking-wide hover:bg-[#0d1a0d] transition disabled:opacity-60 disabled:cursor-wait"
        >
          {status === "sending" ? "Sending…" : "Send to Hector Landscaping"}
          {status !== "sending" && <ArrowRight size={16} weight="bold" />}
        </button>
      </div>
    </form>
  );
}

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
    <label className="block">
      <span className="block text-[11px] tracking-[0.18em] uppercase text-[#5a6a4f] mb-2">
        {label}
        {required && <span className="text-[#7a1f1f] ml-1">*</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full bg-transparent border-b border-[#1a2e1a]/25 focus:border-[#1a2e1a] outline-none py-2.5 text-[15px] text-[#1a1612] placeholder:text-[#1a1612]/35 transition-colors"
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
    <label className="block">
      <span className="block text-[11px] tracking-[0.18em] uppercase text-[#5a6a4f] mb-2">
        {label}
      </span>
      <select
        name={name}
        defaultValue={options[0]}
        className="w-full bg-transparent border-b border-[#1a2e1a]/25 focus:border-[#1a2e1a] outline-none py-2.5 text-[15px] text-[#1a1612]"
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
    <label className="block">
      <span className="block text-[11px] tracking-[0.18em] uppercase text-[#5a6a4f] mb-2">
        {label}
        {required && <span className="text-[#7a1f1f] ml-1">*</span>}
      </span>
      <textarea
        name={name}
        required={required}
        placeholder={placeholder}
        rows={5}
        className="w-full bg-transparent border-b border-[#1a2e1a]/25 focus:border-[#1a2e1a] outline-none py-2.5 text-[15px] text-[#1a1612] placeholder:text-[#1a1612]/35 transition-colors resize-y"
      />
    </label>
  );
}
