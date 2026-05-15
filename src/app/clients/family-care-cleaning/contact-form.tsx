"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle, Warning } from "@phosphor-icons/react";

/**
 * Family Care Cleaning quote-request form.
 *
 * Posts to /api/clients/inquire which forwards to Family Care Cleaning
 * (familycarecleaning@gmail.com) and pings Ben for deliverability.
 *
 * Visual: cream card with soft gold borders + leaf-green primary
 * button. Mirrors the Hector contact form structure (bordered inputs,
 * field/select/textarea trio) tuned for cleaning-specific fields:
 * home size, service type, frequency.
 */
export default function FamilyCareCleaningContactForm({
  services,
}: {
  services: string[];
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">(
    "idle",
  );
  const [errMsg, setErrMsg] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrMsg("");

    const fd = new FormData(e.currentTarget);
    const payload = {
      slug: "family-care-cleaning",
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      property_address: String(fd.get("property_address") || "").trim(),
      service: String(fd.get("service") || "").trim(),
      home_size: String(fd.get("home_size") || "").trim(),
      frequency: String(fd.get("frequency") || "").trim(),
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
      setErrMsg("A few words about your home helps us prepare a fair quote.");
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
        setErrMsg(
          data.error || "Something went wrong. Please try again or call us.",
        );
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
      <div className="bg-white border border-[#d99a0f]/25 rounded-2xl p-10 sm:p-12 shadow-[0_18px_50px_-30px_rgba(217,154,15,0.5)]">
        <CheckCircle
          size={44}
          weight="duotone"
          className="text-[#2f5c24] mb-5"
        />
        <h3 className="font-serif text-[28px] sm:text-[32px] text-[#1f2820] tracking-tight mb-3">
          Thanks &mdash; your note&rsquo;s on its way.
        </h3>
        <p className="text-[16px] leading-relaxed text-[#1f2820]/75 max-w-md">
          We typically reply within one business day and will reach out the
          way you asked, with a no-obligation quote for your home.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-[#d99a0f]/25 rounded-2xl p-7 sm:p-10 shadow-[0_18px_50px_-30px_rgba(217,154,15,0.45)]"
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
          placeholder="(360) 555-0100"
        />
        <Field
          label="Home address"
          name="property_address"
          autoComplete="street-address"
          placeholder="City or street so we can confirm the area"
        />

        <Select
          label="Service"
          name="service"
          options={["Not sure yet", ...services]}
        />
        <Select
          label="Home size"
          name="home_size"
          options={[
            "Studio / 1 bed",
            "2 bed · 1 bath",
            "3 bed · 2 bath",
            "4 bed · 2+ bath",
            "5+ bed · larger",
          ]}
        />
        <Select
          label="How often"
          name="frequency"
          options={[
            "One-time only",
            "Weekly",
            "Every 2 weeks",
            "Monthly",
            "Move-in / move-out",
          ]}
        />
        <Select
          label="Preferred contact"
          name="preferred_contact"
          options={["Either", "Email", "Phone call", "Text message"]}
        />

        <div className="sm:col-span-2">
          <Textarea
            label="Tell us about your home"
            name="message"
            required
            placeholder="Square footage, pets, anything that needs extra attention, and when you'd like the first visit."
          />
        </div>
      </div>

      {status === "err" && (
        <div className="mt-5 flex items-start gap-2 text-[14px] text-[#7a1f1f] bg-[#fbeaea] border border-[#7a1f1f]/15 px-4 py-3 rounded-lg">
          <Warning size={18} weight="fill" className="mt-0.5 shrink-0" />
          <span>{errMsg}</span>
        </div>
      )}

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
        <p className="text-[12px] text-[#1f2820]/55 max-w-xs">
          Free, no-obligation quote. We typically reply within one
          business day.
        </p>
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center gap-2 bg-[#2f5c24] text-[#fdf8ec] px-7 py-3.5 text-[14px] font-medium tracking-wide hover:bg-[#1f3f17] transition disabled:opacity-60 disabled:cursor-wait rounded-full shadow-[0_8px_24px_-10px_rgba(47,92,36,0.6)]"
        >
          {status === "sending" ? "Sending…" : "Request my quote"}
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
      <span className="block text-[11px] tracking-[0.18em] uppercase text-[#7a6a3a] mb-2">
        {label}
        {required && <span className="text-[#7a1f1f] ml-1">*</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full bg-[#fdf8ec]/40 border border-[#2f5c24]/15 focus:border-[#2f5c24]/50 focus:bg-white rounded-lg outline-none px-3 py-2.5 text-[15px] text-[#1f2820] placeholder:text-[#1f2820]/35 transition-colors"
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
      <span className="block text-[11px] tracking-[0.18em] uppercase text-[#7a6a3a] mb-2">
        {label}
      </span>
      <select
        name={name}
        defaultValue={options[0]}
        className="w-full bg-[#fdf8ec]/40 border border-[#2f5c24]/15 focus:border-[#2f5c24]/50 focus:bg-white rounded-lg outline-none px-3 py-2.5 text-[15px] text-[#1f2820]"
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
      <span className="block text-[11px] tracking-[0.18em] uppercase text-[#7a6a3a] mb-2">
        {label}
        {required && <span className="text-[#7a1f1f] ml-1">*</span>}
      </span>
      <textarea
        name={name}
        required={required}
        placeholder={placeholder}
        rows={5}
        className="w-full bg-[#fdf8ec]/40 border border-[#2f5c24]/15 focus:border-[#2f5c24]/50 focus:bg-white rounded-lg outline-none px-3 py-2.5 text-[15px] text-[#1f2820] placeholder:text-[#1f2820]/35 transition-colors resize-y"
      />
    </label>
  );
}
