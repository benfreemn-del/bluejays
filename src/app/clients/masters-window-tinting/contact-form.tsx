"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle, Warning } from "@phosphor-icons/react";

/**
 * Masters Window Tinting customer-facing quote request form.
 *
 * Posts to /api/contact-form/[prospectId] which (per CLAUDE.md
 * "Booking Automation" feature) auto-texts the customer a booking
 * link and emails the shop. Falls back to a thank-you state on
 * success or a friendly inline error on failure.
 */
type Props = {
  prospectId: string;
  services: string[];
};

export default function MastersContactForm({ prospectId, services }: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [errMsg, setErrMsg] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrMsg("");

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      service_requested: String(fd.get("service") || "").trim(),
      vehicle: String(fd.get("vehicle") || "").trim(),
      message: String(fd.get("message") || "").trim(),
    };

    if (!payload.name) {
      setStatus("err");
      setErrMsg("Please tell us your name.");
      return;
    }
    if (!payload.phone) {
      setStatus("err");
      setErrMsg("Please leave a phone number so we can text your quote.");
      return;
    }
    if (!payload.message) {
      setStatus("err");
      setErrMsg("A few words about what you need helps us prep your quote.");
      return;
    }

    try {
      const res = await fetch(`/api/contact-form/${prospectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: payload.name,
          customer_phone: payload.phone,
          customer_email: payload.email,
          service_requested: payload.service_requested,
          message: `${payload.vehicle ? `Vehicle: ${payload.vehicle}\n\n` : ""}${payload.message}`,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || data.ok === false) {
        setStatus("err");
        setErrMsg(data.error || "Something went wrong. Please call us at (631) 226-4300.");
        return;
      }
      setStatus("ok");
    } catch {
      setStatus("err");
      setErrMsg("Network error. Please call us at (631) 226-4300.");
    }
  }

  if (status === "ok") {
    return (
      <div
        className="border p-10 sm:p-12"
        style={{
          background: "rgba(255, 255, 255, 0.04)",
          borderColor: "rgba(14, 165, 233, 0.4)",
          fontFamily: "'Barlow', sans-serif",
        }}
      >
        <CheckCircle size={48} weight="duotone" style={{ color: "#0ea5e9" }} className="mb-5" />
        <h3
          className="text-[28px] sm:text-[34px] text-white tracking-wide uppercase mb-3 font-bold"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          Quote Request Received.
        </h3>
        <p className="text-[16px] leading-relaxed max-w-md" style={{ color: "rgba(255, 255, 255, 0.75)" }}>
          We just got it. You will hear back within the hour during shop
          hours, or first thing tomorrow if you sent this overnight. Same
          day quotes available — call (631) 226-4300 to lock in a slot.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border p-7 sm:p-10"
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        borderColor: "rgba(203, 213, 225, 0.18)",
        fontFamily: "'Barlow', sans-serif",
      }}
      noValidate
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Your Name" name="name" required autoComplete="name" />
        <Field
          label="Phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          placeholder="(631) 555-0100"
        />
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
        />
        <Field
          label="Vehicle (Year / Make / Model)"
          name="vehicle"
          placeholder="2023 BMW M3"
        />

        <div className="sm:col-span-2">
          <Select
            label="What Do You Need?"
            name="service"
            options={["Pick a service", ...services]}
          />
        </div>

        <div className="sm:col-span-2">
          <Textarea
            label="Tell Us About Your Project"
            name="message"
            required
            placeholder="Glass type, package, timing, anything we should know."
          />
        </div>
      </div>

      {status === "err" && (
        <div
          className="mt-5 flex items-start gap-2 text-[14px] px-4 py-3 border"
          style={{
            color: "#fca5a5",
            background: "rgba(127, 29, 29, 0.25)",
            borderColor: "rgba(248, 113, 113, 0.3)",
          }}
        >
          <Warning size={18} weight="fill" className="mt-0.5 shrink-0" />
          <span>{errMsg}</span>
        </div>
      )}

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
        <p className="text-[12px] max-w-xs" style={{ color: "rgba(255, 255, 255, 0.5)" }}>
          Free quote. No obligation. Same day quotes during shop hours.
        </p>
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center gap-2 px-7 py-3.5 text-[13px] font-bold tracking-[0.18em] uppercase transition-all disabled:opacity-60 disabled:cursor-wait"
          style={{
            background: "linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%)",
            color: "white",
            fontFamily: "'Barlow Condensed', sans-serif",
            boxShadow: "0 4px 14px rgba(29, 78, 216, 0.4)",
          }}
        >
          {status === "sending" ? "Sending..." : "Get My Free Quote"}
          {status !== "sending" && <ArrowRight size={15} weight="bold" />}
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
      <span
        className="block text-[10px] tracking-[0.22em] uppercase mb-2 font-semibold"
        style={{ color: "#0ea5e9", fontFamily: "'Barlow Condensed', sans-serif" }}
      >
        {label}
        {required && <span style={{ color: "#f87171" }} className="ml-1">*</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full bg-transparent border-b outline-none py-2.5 text-[15px] text-white placeholder:opacity-30 transition-colors focus:border-white"
        style={{ borderColor: "rgba(203, 213, 225, 0.25)" }}
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
      <span
        className="block text-[10px] tracking-[0.22em] uppercase mb-2 font-semibold"
        style={{ color: "#0ea5e9", fontFamily: "'Barlow Condensed', sans-serif" }}
      >
        {label}
      </span>
      <select
        name={name}
        defaultValue={options[0]}
        className="w-full bg-transparent border-b outline-none py-2.5 text-[15px] text-white focus:border-white"
        style={{ borderColor: "rgba(203, 213, 225, 0.25)" }}
      >
        {options.map((o) => (
          <option key={o} value={o} style={{ background: "#0a0a0a", color: "white" }}>
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
      <span
        className="block text-[10px] tracking-[0.22em] uppercase mb-2 font-semibold"
        style={{ color: "#0ea5e9", fontFamily: "'Barlow Condensed', sans-serif" }}
      >
        {label}
        {required && <span style={{ color: "#f87171" }} className="ml-1">*</span>}
      </span>
      <textarea
        name={name}
        required={required}
        placeholder={placeholder}
        rows={5}
        className="w-full bg-transparent border-b outline-none py-2.5 text-[15px] text-white placeholder:opacity-30 transition-colors focus:border-white resize-y"
        style={{ borderColor: "rgba(203, 213, 225, 0.25)" }}
      />
    </label>
  );
}
