"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle, Warning } from "@phosphor-icons/react";

/**
 * Peninsula Paving customer-facing free-estimate request form.
 * Posts to /api/contact-form/[prospectId] — auto-texts the customer
 * a booking link AND emails Peninsula Paving on success. Same plumb
 * as meyer-electric/contact-form.tsx.
 */
type Props = {
  prospectId: string;
  services: string[];
};

const ACCENT = "#ea580c";
const ACCENT_DEEP = "#c2410c";

export default function PeninsulaPavingContactForm({ prospectId, services }: Props) {
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
      address: String(fd.get("address") || "").trim(),
      sqft: String(fd.get("sqft") || "").trim(),
      message: String(fd.get("message") || "").trim(),
    };

    if (!payload.name) {
      setStatus("err");
      setErrMsg("Please tell us your name.");
      return;
    }
    if (!payload.phone) {
      setStatus("err");
      setErrMsg("Please leave a phone number so we can call you back.");
      return;
    }
    if (!payload.message) {
      setStatus("err");
      setErrMsg("A few words about the job helps us prep your estimate.");
      return;
    }

    try {
      const composedMessage = [
        payload.address ? `Site Address: ${payload.address}` : "",
        payload.sqft ? `Approx Size: ${payload.sqft}` : "",
        payload.message,
      ]
        .filter(Boolean)
        .join("\n\n");

      const res = await fetch(`/api/contact-form/${prospectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: payload.name,
          customer_phone: payload.phone,
          customer_email: payload.email,
          service_requested: payload.service_requested,
          message: composedMessage,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || data.ok === false) {
        setStatus("err");
        setErrMsg(
          data.error ||
            "Something went wrong. Please call us at (360) 477-7015.",
        );
        return;
      }
      setStatus("ok");
    } catch {
      setStatus("err");
      setErrMsg("Network error. Please call us at (360) 477-7015.");
    }
  }

  if (status === "ok") {
    return (
      <div
        className="border p-7 sm:p-8 rounded-xl"
        style={{
          background: "#ffffff",
          borderColor: "rgba(234, 88, 12, 0.35)",
          fontFamily: "'Inter', sans-serif",
          boxShadow: "0 10px 30px rgba(28, 20, 16, 0.08)",
        }}
      >
        <CheckCircle
          size={48}
          weight="duotone"
          style={{ color: ACCENT }}
          className="mb-5"
        />
        <h3
          className="text-[28px] sm:text-[34px] tracking-tight mb-3 font-bold"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#1c1410" }}
        >
          Estimate request received.
        </h3>
        <p
          className="text-[16px] leading-relaxed max-w-md"
          style={{ color: "rgba(28, 20, 16, 0.78)" }}
        >
          Thanks. A Frick crew member will be in touch within one business
          day to set up a site walk and price the job. For anything
          urgent, call (360) 477-7015 — 41 years answering our own phone.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border p-5 sm:p-7 rounded-xl"
      style={{
        background: "#ffffff",
        borderColor: "rgba(234, 88, 12, 0.22)",
        fontFamily: "'Inter', sans-serif",
        boxShadow: "0 10px 30px rgba(28, 20, 16, 0.06)",
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
          placeholder="(360) 555-0100"
        />
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
        />
        <Field
          label="Site Address (or City)"
          name="address"
          placeholder="Sequim, WA"
        />

        <div className="sm:col-span-2">
          <Select
            label="What do you need?"
            name="service"
            options={["Pick a service", ...services]}
          />
        </div>

        <Field
          label="Approx Size (sq ft or feet)"
          name="sqft"
          placeholder="e.g. 1,200 sq ft driveway"
        />
        <Field
          label="Timeline"
          name="timeline"
          placeholder="ASAP / next month / spring"
        />

        <div className="sm:col-span-2">
          <Textarea
            label="Tell us about the job"
            name="message"
            required
            placeholder="Residential driveway repave, parking lot stripe, HOA road, gravel-to-asphalt conversion, drainage issues — anything we should know."
          />
        </div>
      </div>

      {status === "err" && (
        <div
          className="mt-5 flex items-start gap-2 text-[14px] px-4 py-3 border rounded"
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
        <p
          className="text-[12px] max-w-xs"
          style={{ color: "rgba(28, 20, 16, 0.58)" }}
        >
          Free estimate. No obligation. Site walks usually scheduled within
          a week.
        </p>
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center gap-2 px-7 py-3.5 text-[13px] font-bold tracking-[0.14em] uppercase transition-all disabled:opacity-60 disabled:cursor-wait rounded-md hover:brightness-110 active:scale-95 text-white"
          style={{
            background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DEEP} 100%)`,
            fontFamily: "'Space Grotesk', sans-serif",
            boxShadow: "0 4px 14px rgba(234, 88, 12, 0.4)",
          }}
        >
          {status === "sending" ? "Sending..." : "Request Free Estimate"}
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
        style={{ color: ACCENT_DEEP, fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {label}
        {required && (
          <span style={{ color: "#dc2626" }} className="ml-1">
            *
          </span>
        )}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full bg-transparent border-b outline-none py-2.5 text-[15px] placeholder:opacity-40 transition-colors"
        style={{
          borderColor: "rgba(234, 88, 12, 0.35)",
          color: "#1c1410",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = ACCENT_DEEP; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(234, 88, 12, 0.35)"; }}
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
        style={{ color: ACCENT_DEEP, fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {label}
      </span>
      <select
        name={name}
        defaultValue={options[0]}
        className="w-full bg-transparent border-b outline-none py-2.5 text-[15px]"
        style={{
          borderColor: "rgba(234, 88, 12, 0.35)",
          color: "#1c1410",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = ACCENT_DEEP; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(234, 88, 12, 0.35)"; }}
      >
        {options.map((o) => (
          <option
            key={o}
            value={o}
            style={{ background: "#ffffff", color: "#1c1410" }}
          >
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
        style={{ color: ACCENT_DEEP, fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {label}
        {required && (
          <span style={{ color: "#dc2626" }} className="ml-1">
            *
          </span>
        )}
      </span>
      <textarea
        name={name}
        required={required}
        placeholder={placeholder}
        rows={5}
        className="w-full bg-transparent border-b outline-none py-2.5 text-[15px] placeholder:opacity-40 transition-colors resize-y"
        style={{
          borderColor: "rgba(234, 88, 12, 0.35)",
          color: "#1c1410",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = ACCENT_DEEP; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(234, 88, 12, 0.35)"; }}
      />
    </label>
  );
}
