"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle, Warning, HandsPraying } from "@phosphor-icons/react";

/**
 * Thrive Church Prayer Request form — a focused, low-friction surface
 * for visitors and members to submit a prayer ask. Posts to
 * /api/clients/inquire with form_type=prayer_request so Ben can route
 * it to the prayer team inbox (office@thrivesequim.com for now).
 *
 * Deliberately smaller than the Connect Card — only name + (optional)
 * contact + the request. Removes friction so people actually submit.
 * "Keep it private" toggle so requests can flow to leadership only,
 * not to a public list.
 */

const TEAL = "#0d4f4a";
const TEAL_DEEP = "#0a3a36";
const AMBER = "#d97706";
const CREAM = "#fbf7ee";
const INK = "#1b2922";

export default function PrayerRequestForm() {
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
      slug: "thrive-church-sequim",
      form_type: "prayer_request",
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      keep_private: fd.get("keep_private") === "on" ? "yes" : "no",
      follow_up_ok: fd.get("follow_up_ok") === "on" ? "yes" : "no",
      message: String(fd.get("message") || "").trim(),
    };

    if (!payload.message) {
      setStatus("err");
      setErrMsg("Please share what you'd like prayer for.");
      return;
    }

    try {
      const res = await fetch("/api/clients/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || data.ok === false) {
        setStatus("err");
        setErrMsg(
          data.error ||
            "Something went wrong. Please try again or call (360) 683-7981.",
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
      <div
        className="rounded-2xl p-8 sm:p-10 border"
        style={{
          background: "#ffffff",
          borderColor: "rgba(13, 79, 74, 0.25)",
          boxShadow: "0 18px 50px -30px rgba(13, 79, 74, 0.4)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
          style={{ background: "rgba(217, 119, 6, 0.12)", color: AMBER }}
        >
          <HandsPraying size={28} weight="duotone" />
        </div>
        <h3
          className="text-[24px] sm:text-[28px] tracking-tight mb-3"
          style={{
            color: INK,
            fontFamily: "'Fraunces', serif",
            fontWeight: 600,
          }}
        >
          We&rsquo;re praying.
        </h3>
        <p
          className="text-[15px] leading-relaxed max-w-md"
          style={{ color: "rgba(27, 41, 34, 0.72)" }}
        >
          Your request just landed with our prayer team. We&rsquo;ll lift it up
          this week. If you asked to hear back, someone will reach out
          personally.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-7 sm:p-9 border"
      style={{
        background: "#ffffff",
        borderColor: "rgba(13, 79, 74, 0.18)",
        boxShadow: "0 18px 50px -30px rgba(13, 79, 74, 0.35)",
        fontFamily: "'Inter', sans-serif",
      }}
      noValidate
    >
      <div className="flex items-center gap-2.5 mb-6">
        <span
          className="inline-flex items-center justify-center w-9 h-9 rounded-full"
          style={{ background: "rgba(217, 119, 6, 0.14)", color: AMBER }}
        >
          <HandsPraying size={18} weight="fill" />
        </span>
        <span
          className="text-[13px] tracking-[0.22em] uppercase font-bold"
          style={{ color: AMBER, fontFamily: "'Inter', sans-serif" }}
        >
          Prayer Request
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Name (optional)" name="name" autoComplete="name" />
        <Field
          label="Email or phone (optional)"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="So we can pray with you personally"
        />
        <div className="sm:col-span-2">
          <Textarea
            label="What can we pray for?"
            name="message"
            required
            placeholder="Big or small. A few words is enough. The whole prayer team will lift this up this week."
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2.5">
        <label
          className="flex items-start gap-2.5 text-[13px] cursor-pointer"
          style={{ color: "rgba(27, 41, 34, 0.78)" }}
        >
          <input
            type="checkbox"
            name="keep_private"
            className="mt-[3px] accent-[#0d4f4a]"
            defaultChecked
          />
          <span>Keep this private (just our pastoral team, not the prayer list)</span>
        </label>
        <label
          className="flex items-start gap-2.5 text-[13px] cursor-pointer"
          style={{ color: "rgba(27, 41, 34, 0.78)" }}
        >
          <input
            type="checkbox"
            name="follow_up_ok"
            className="mt-[3px] accent-[#0d4f4a]"
          />
          <span>It&rsquo;s OK to follow up with me about this</span>
        </label>
      </div>

      {status === "err" && (
        <div
          className="mt-5 flex items-start gap-2 text-[14px] px-4 py-3 border rounded-lg"
          style={{
            color: "#7a1f1f",
            background: "#fbeaea",
            borderColor: "rgba(122, 31, 31, 0.18)",
          }}
        >
          <Warning size={18} weight="fill" className="mt-0.5 shrink-0" />
          <span>{errMsg}</span>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex cursor-pointer items-center gap-2 px-6 py-3 text-[13px] font-bold tracking-[0.12em] uppercase transition-all disabled:cursor-wait disabled:opacity-60 rounded-full hover:brightness-110 active:scale-95"
          style={{
            background: AMBER,
            color: "#ffffff",
            fontFamily: "'Inter', sans-serif",
            boxShadow: "0 8px 24px -10px rgba(217, 119, 6, 0.6)",
          }}
        >
          {status === "sending" ? "Sending…" : "Submit Request"}
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
        className="block text-[12px] tracking-[0.18em] uppercase mb-2 font-bold"
        style={{ color: TEAL_DEEP, fontFamily: "'Inter', sans-serif" }}
      >
        {label}
        {required && (
          <span style={{ color: "#7a1f1f" }} className="ml-1">
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
        className="w-full bg-[#fbf7ee]/50 border rounded-lg outline-none px-3 py-2.5 text-[15px] transition-colors focus:bg-white"
        style={{
          color: INK,
          borderColor: "rgba(13, 79, 74, 0.18)",
        }}
      />
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
        className="block text-[12px] tracking-[0.18em] uppercase mb-2 font-bold"
        style={{ color: TEAL_DEEP, fontFamily: "'Inter', sans-serif" }}
      >
        {label}
        {required && (
          <span style={{ color: "#7a1f1f" }} className="ml-1">
            *
          </span>
        )}
      </span>
      <textarea
        name={name}
        required={required}
        placeholder={placeholder}
        rows={4}
        className="w-full bg-[#fbf7ee]/50 border rounded-lg outline-none px-3 py-2.5 text-[15px] transition-colors focus:bg-white resize-y"
        style={{
          color: INK,
          borderColor: "rgba(13, 79, 74, 0.18)",
        }}
      />
    </label>
  );
}
