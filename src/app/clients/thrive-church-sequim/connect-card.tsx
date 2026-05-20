"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle, Warning, HandHeart } from "@phosphor-icons/react";

/**
 * Thrive Church Connect Card — the primary conversion form.
 *
 * Mirrors the digital connect card every modern church uses on first
 * visit: name + how to reach you + visit type + how we can pray /
 * follow up. Posts to /api/clients/inquire which routes to
 * office@thrivesequim.com and pings Ben for deliverability.
 *
 * Visual: warm cream card with deep teal accents + amber CTA. Light
 * theme variant of the Family Care Cleaning form pattern, retuned
 * with church-specific fields (visit type, kids in tow, prayer ask).
 */

const TEAL = "#0d4f4a";
const TEAL_DEEP = "#0a3a36";
const AMBER = "#d97706";
const AMBER_LIGHT = "#fbbf24";
const CREAM = "#fbf7ee";
const INK = "#1b2922";

// Ministry opt-in checkboxes added 2026-05-19 — Ben noticed visitors
// clicking the 4 ministry cards landed at the Connect Card with no way
// to say which ministry they came from. The Ministries Grid now passes
// `?group=<id>` and the matching checkbox auto-checks on mount.
const GROUPS: { id: string; label: string; short: string }[] = [
  { id: "thrive-groups", label: "Thrive Groups (small groups for adults)", short: "Thrive Groups" },
  { id: "next-wave-kids", label: "Next Wave Kids (infants–5th grade)", short: "Next Wave Kids" },
  { id: "next-wave-youth", label: "Next Wave Youth (middle & high school)", short: "Next Wave Youth" },
  { id: "thrive-preschool", label: "Thrive Preschool (licensed, ages 2.5–5)", short: "Thrive Preschool" },
];
const GROUP_IDS = new Set(GROUPS.map((g) => g.id));

export default function ConnectCardForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">(
    "idle",
  );
  const [errMsg, setErrMsg] = useState<string>("");
  // Set on mount so server can reject sub-2.5s submissions (bots).
  // useRef avoids re-renders and survives the form lifecycle.
  const loadedAtRef = useRef<number>(0);
  // Selected ministry checkboxes — Set<id> for cheap toggle + dedup.
  // Pre-populated on mount from `?group=<id>` if the URL has one.
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(
    () => new Set(),
  );
  useEffect(() => {
    loadedAtRef.current = Date.now();
    // window-level access only on mount — avoids the useSearchParams()
    // Suspense-boundary requirement Next.js 16 added.
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      const group = params.get("group");
      if (group && GROUP_IDS.has(group)) {
        setSelectedGroups(new Set([group]));
      }
    } catch {}
  }, []);

  function toggleGroup(id: string) {
    setSelectedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrMsg("");

    const fd = new FormData(e.currentTarget);
    // Resolve selected group IDs to human-readable labels for the lead
    // email — Ben sees "Next Wave Kids, Thrive Preschool" not raw IDs.
    const groupInterestsList = GROUPS
      .filter((g) => selectedGroups.has(g.id))
      .map((g) => g.short);
    const payload = {
      slug: "thrive-church-sequim",
      form_type: "connect_card",
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      visit_type: String(fd.get("visit_type") || "").trim(),
      bringing_kids: String(fd.get("bringing_kids") || "").trim(),
      heard_about: String(fd.get("heard_about") || "").trim(),
      next_step: String(fd.get("next_step") || "").trim(),
      prayer_request: String(fd.get("prayer_request") || "").trim(),
      group_interests: groupInterestsList.join(", "),
      message: String(fd.get("message") || "").trim(),
      // Spam guards: honeypot + timestamp. Server silent-drops if either
      // trips, so bots get ok:true and never tune their attack.
      website: String(fd.get("website") || ""),
      _loadedAt: loadedAtRef.current,
    };

    if (!payload.name) {
      setStatus("err");
      setErrMsg("Please tell us your name.");
      return;
    }
    if (!payload.email && !payload.phone) {
      setStatus("err");
      setErrMsg("Please leave an email or phone so we can follow up.");
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
            "Something went wrong. Please try again or call us at (360) 683-7981.",
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
        className="rounded-2xl p-10 sm:p-12 border"
        style={{
          background: "#ffffff",
          borderColor: "rgba(13, 79, 74, 0.25)",
          boxShadow: "0 18px 50px -30px rgba(13, 79, 74, 0.45)",
          fontFamily: "var(--font-thrive-body), sans-serif",
        }}
      >
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
          style={{ background: "rgba(13, 79, 74, 0.10)", color: TEAL }}
        >
          <CheckCircle size={32} weight="duotone" />
        </div>
        <h3
          className="text-[28px] sm:text-[34px] tracking-tight mb-3"
          style={{
            color: INK,
            fontFamily: "var(--font-thrive-display), serif",
            fontWeight: 600,
          }}
        >
          We&rsquo;re so glad you reached out.
        </h3>
        <p
          className="text-[16px] leading-relaxed max-w-md"
          style={{ color: "rgba(27, 41, 34, 0.72)" }}
        >
          Someone from the Thrive team will be in touch within a couple days.
          Can&rsquo;t wait for that? Come Sunday at 10:30am &mdash; we&rsquo;ll
          look for you. Need us sooner? Call <strong>(360) 683-7981</strong>.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-7 sm:p-10 border"
      style={{
        background: "#ffffff",
        borderColor: "rgba(13, 79, 74, 0.18)",
        boxShadow: "0 18px 50px -30px rgba(13, 79, 74, 0.4)",
        fontFamily: "var(--font-thrive-body), sans-serif",
      }}
      noValidate
    >
      {/* Honeypot — off-screen, aria-hidden, untabbable. Bots see the
          `website` field in the HTML and fill it; humans never do. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          height: 0,
          width: 0,
          overflow: "hidden",
        }}
      >
        <label>
          Website (leave blank)
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </label>
      </div>

      <div className="flex items-center gap-2.5 mb-6">
        <span
          className="inline-flex items-center justify-center w-9 h-9 rounded-full"
          style={{ background: "rgba(13, 79, 74, 0.10)", color: TEAL }}
        >
          <HandHeart size={18} weight="fill" />
        </span>
        <span
          className="text-[13px] tracking-[0.22em] uppercase font-bold"
          style={{ color: TEAL, fontFamily: "var(--font-thrive-body), sans-serif" }}
        >
          Connect Card
        </span>
      </div>

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
        <Select
          label="When were you here?"
          name="visit_type"
          options={[
            "First Sunday",
            "Visited a few times",
            "Regular attender",
            "Watching online",
            "Haven't visited yet",
          ]}
        />
        <Select
          label="Bringing kids?"
          name="bringing_kids"
          options={[
            "Just me",
            "Yes — preschool age",
            "Yes — elementary age",
            "Yes — junior high / high school",
            "Multiple ages",
          ]}
        />
        <Select
          label="How did you hear about us?"
          name="heard_about"
          options={[
            "A friend / family member",
            "Drove by",
            "Online search",
            "Social media",
            "Lived here a while, finally came",
            "Other",
          ]}
        />

        <div className="sm:col-span-2">
          <Select
            label="What would you like next?"
            name="next_step"
            options={[
              "Just saying hi",
              "Plan a first visit",
              "Connect with a pastor",
              "Find a Thrive Group",
              "Learn about Next Wave Kids/Youth",
              "Sign up for Preschool info",
              "Get baptized",
              "Volunteer / serve",
              "Request prayer",
            ]}
          />
        </div>

        {/* Ministry / group opt-in checkboxes. Tap-friendly pill chips
            (mobile target ≥44px), each toggles a Set entry. Auto-checked
            when the visitor arrives via /clients/thrive-church-sequim?group=…
            from a Ministry Card click. */}
        <div className="sm:col-span-2">
          <span
            className="block text-[12px] tracking-[0.18em] uppercase mb-3 font-bold"
            style={{ color: TEAL_DEEP }}
          >
            Interested in any of these? (check all that apply)
          </span>
          <div className="flex flex-wrap gap-2.5">
            {GROUPS.map((g) => {
              const checked = selectedGroups.has(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => toggleGroup(g.id)}
                  className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-[14px] transition-all hover:brightness-105 active:scale-[0.98]"
                  style={{
                    background: checked ? TEAL : "rgba(251, 247, 238, 0.6)",
                    color: checked ? CREAM : INK,
                    borderColor: checked ? TEAL_DEEP : "rgba(13, 79, 74, 0.25)",
                    fontFamily: "var(--font-thrive-body), sans-serif",
                  }}
                >
                  <span
                    aria-hidden
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors"
                    style={{
                      background: checked ? AMBER : "transparent",
                      borderColor: checked ? AMBER : "rgba(13, 79, 74, 0.45)",
                    }}
                  >
                    {checked && (
                      <CheckCircle size={12} weight="fill" color={CREAM} />
                    )}
                  </span>
                  <span className="text-[14px] font-medium">{g.short}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="sm:col-span-2">
          <Textarea
            label="Anything else you'd like us to know?"
            name="message"
            placeholder="Tell us a bit about yourself, what you're hoping to find, or how we can pray for you. Totally optional — even a sentence helps us reach back well."
          />
        </div>
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

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
        <p
          className="text-[12px] max-w-xs"
          style={{ color: "rgba(27, 41, 34, 0.55)" }}
        >
          We&rsquo;ll never share your info. A real person reads every card
          and replies personally.
        </p>
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex cursor-pointer items-center gap-2 px-7 py-3.5 text-[13px] font-bold tracking-[0.12em] uppercase transition-all disabled:cursor-wait disabled:opacity-60 rounded-full hover:brightness-110 active:scale-95"
          style={{
            background: TEAL,
            color: CREAM,
            fontFamily: "var(--font-thrive-body), sans-serif",
            boxShadow: "0 8px 24px -10px rgba(13, 79, 74, 0.6)",
          }}
        >
          {status === "sending" ? "Sending…" : "Send My Card"}
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
        style={{ color: TEAL_DEEP, fontFamily: "var(--font-thrive-body), sans-serif" }}
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
        onFocus={(e) =>
          (e.currentTarget.style.borderColor = "rgba(13, 79, 74, 0.5)")
        }
        onBlur={(e) =>
          (e.currentTarget.style.borderColor = "rgba(13, 79, 74, 0.18)")
        }
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
        className="block text-[12px] tracking-[0.18em] uppercase mb-2 font-bold"
        style={{ color: TEAL_DEEP, fontFamily: "var(--font-thrive-body), sans-serif" }}
      >
        {label}
      </span>
      <select
        name={name}
        defaultValue={options[0]}
        className="w-full bg-[#fbf7ee]/50 border rounded-lg outline-none px-3 py-2.5 text-[15px] transition-colors focus:bg-white"
        style={{
          color: INK,
          borderColor: "rgba(13, 79, 74, 0.18)",
        }}
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
        className="block text-[12px] tracking-[0.18em] uppercase mb-2 font-bold"
        style={{ color: TEAL_DEEP, fontFamily: "var(--font-thrive-body), sans-serif" }}
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
