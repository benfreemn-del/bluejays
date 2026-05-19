"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle, Warning } from "@phosphor-icons/react";

/**
 * VolunteerSignup — direct sign-up form for people who already know
 * what they want to serve in (or who skipped the quiz). Posts to
 * /api/clients/inquire with form_type = "volunteer_signup".
 *
 * Same visual treatment as ConnectCardForm + PrayerRequestForm.
 */

const TEAL = "#0d4f4a";
const TEAL_DEEP = "#0a3a36";
const AMBER = "#d97706";
const CREAM = "#fbf7ee";
const INK = "#1b2922";

const TEAMS = [
  "Not sure yet — surprise me",
  "Next Wave Kids (nursery → 5th grade)",
  "Next Wave Youth (middle + high school)",
  "Worship & Tech (sound / lights / slides / music)",
  "Coffee & Hospitality",
  "Setup & Production",
  "Table of Grace (community meals)",
  "Prayer team",
  "Across the Street / Around the World (outreach)",
  "Thrive Group co-leader (small groups)",
  "Communications / Photo / Social",
];

export default function VolunteerSignup() {
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
      form_type: "volunteer_signup",
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      team: String(fd.get("team") || "").trim(),
      availability: String(fd.get("availability") || "").trim(),
      experience: String(fd.get("experience") || "").trim(),
      message: String(fd.get("message") || "").trim(),
    };

    if (!payload.name) {
      setStatus("err");
      setErrMsg("Tell us your name.");
      return;
    }
    if (!payload.email && !payload.phone) {
      setStatus("err");
      setErrMsg("Leave an email or phone so we can reach you.");
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
          data.error || "Something went wrong. Call (360) 683-7981.",
        );
        return;
      }
      setStatus("ok");
    } catch {
      setStatus("err");
      setErrMsg("Network error — try again or call us directly.");
    }
  }

  if (status === "ok") {
    return (
      <div
        className="rounded-sm border border-[#0d4f4a]/15 bg-[#fbf7ee] p-8 sm:p-10"
        style={{ fontFamily: "var(--font-thrive-body), sans-serif" }}
      >
        <CheckCircle size={36} weight="duotone" style={{ color: TEAL }} />
        <h3
          className="mt-5 font-[family-name:var(--font-thrive-display)] text-3xl tracking-tight text-[#0d4f4a]"
          style={{ fontWeight: 600 }}
        >
          Welcome to the team.
        </h3>
        <p className="mt-3 text-[15px] leading-relaxed text-[#1b2922]/75">
          We&rsquo;ve got your info. The team lead will reach out this week to
          set up a quick chat + first shift. Thanks for stepping up.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-sm border border-[#0d4f4a]/15 bg-[#fbf7ee] p-7 sm:p-9 lg:p-11"
      style={{ fontFamily: "var(--font-thrive-body), sans-serif" }}
      noValidate
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
        <Select label="Team you'd like to join" name="team" options={TEAMS} />
        <div className="sm:col-span-2">
          <Select
            label="Availability"
            name="availability"
            options={[
              "Sunday mornings",
              "Weeknights",
              "Saturdays / weekends",
              "Pretty flexible",
              "One-shot events only",
            ]}
          />
        </div>
        <div className="sm:col-span-2">
          <Select
            label="Any past experience? (optional)"
            name="experience"
            options={[
              "None — total beginner, that's fine",
              "Served at a previous church",
              "Vocational background (teacher / musician / tech / etc.)",
              "Already serving here, just expanding",
            ]}
          />
        </div>
        <div className="sm:col-span-2">
          <Textarea
            label="Anything we should know?"
            name="message"
            placeholder="Background, allergies, kids in tow, hesitations — anything that'd help us pair you well."
          />
        </div>
      </div>

      {status === "err" && (
        <div
          className="mt-5 flex items-start gap-2 rounded-sm border px-4 py-3 text-[13px]"
          style={{
            color: "#7a1f1f",
            background: "#fbeaea",
            borderColor: "rgba(122,31,31,0.18)",
          }}
        >
          <Warning size={16} weight="fill" className="mt-0.5 shrink-0" />
          <span>{errMsg}</span>
        </div>
      )}

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
        <p className="text-[12px] text-[#1b2922]/55 max-w-xs">
          We&rsquo;ll match you with a team lead and follow up within a week.
        </p>
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#0d4f4a] px-7 py-3.5 text-[12px] font-bold uppercase tracking-[0.16em] text-[#fbf7ee] transition-all hover:bg-[#0a3a36] hover:shadow-[0_14px_36px_-14px_rgba(13,79,74,0.55)] disabled:cursor-wait disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Sign me up"}
          {status !== "sending" && <ArrowRight size={14} weight="bold" />}
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
        className="mb-2 block text-[12px] font-bold uppercase tracking-[0.18em]"
        style={{ color: TEAL_DEEP }}
      >
        {label}
        {required && <span className="ml-1 text-[#7a1f1f]">*</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-lg border border-[#0d4f4a]/18 bg-white px-3 py-2.5 text-[15px] text-[#1b2922] outline-none transition-colors focus:border-[#d97706]"
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
        className="mb-2 block text-[12px] font-bold uppercase tracking-[0.18em]"
        style={{ color: TEAL_DEEP }}
      >
        {label}
      </span>
      <select
        name={name}
        defaultValue={options[0]}
        className="w-full rounded-lg border border-[#0d4f4a]/18 bg-white px-3 py-2.5 text-[15px] text-[#1b2922] outline-none transition-colors focus:border-[#d97706]"
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
      <span
        className="mb-2 block text-[12px] font-bold uppercase tracking-[0.18em]"
        style={{ color: TEAL_DEEP }}
      >
        {label}
        {required && <span className="ml-1 text-[#7a1f1f]">*</span>}
      </span>
      <textarea
        name={name}
        required={required}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-y rounded-lg border border-[#0d4f4a]/18 bg-white px-3 py-2.5 text-[15px] text-[#1b2922] outline-none transition-colors focus:border-[#d97706]"
      />
    </label>
  );
}
