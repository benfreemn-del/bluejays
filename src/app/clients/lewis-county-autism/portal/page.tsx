"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * LCAC owner portal — Michelle's dashboard.
 *
 * Bespoke for LCAC's custom-tier shape: NOT AI System (no Hyperloop /
 * Claude / ad library). What this surface IS: the one page Michelle
 * can land on and see (a) what's coming in across all 5 form inboxes,
 * (b) what her 3 core programs are doing, (c) what's on the events
 * calendar, and (d) exactly how to make changes herself via Claude Code.
 *
 * Six tabs:
 *   1. Today        — site health + form inboxes + next events at a glance
 *   2. Programs     — SMART, S&D Center, Groups & Services (her real work)
 *   3. Events       — coalition meetings + community events + admin link
 *   4. Inbox        — 5 Web3Forms inboxes, mailto: deep-links
 *   5. Edit Site    — Claude Code plain-English editing protocol
 *   6. What's Possible — Mission Dashboard preview (1212)
 *
 * Auth: URL-as-secret. Slug isn't a secret per se, but no outreach
 * surface points at it and robots:noindex keeps it out of search.
 *
 * When LCAC eventually flips DNS, wrap in ClientAuthGate from
 * client-auth.ts.
 */

const ACCENT = "#0d9488";        // teal — LCAC brand-adjacent
const ACCENT_WARM = "#f59e0b";   // warm gold
const ACCENT_SOFT = "#fef3c7";   // soft amber wash

type TabId = "today" | "programs" | "events" | "inbox" | "edit" | "future";

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "today",    label: "Today",         emoji: "🌞" },
  { id: "programs", label: "Programs",      emoji: "🎯" },
  { id: "events",   label: "Events",        emoji: "📅" },
  { id: "inbox",    label: "Inbox",         emoji: "📨" },
  { id: "edit",     label: "Edit Site",     emoji: "✏️" },
  { id: "future",   label: "What's Possible", emoji: "✨" },
];

const FORM_INBOXES = [
  {
    label: "Contact form submissions",
    inbox: "info@lcautism.org",
    note: "Anyone using the Contact page form",
  },
  {
    label: "Volunteer form submissions",
    inbox: "outreach@lcautism.org",
    note: "Anyone signing up to volunteer",
  },
  {
    label: "Sponsor form submissions",
    inbox: "outreach@lcautism.org",
    note: "BMX, Santa, Teal Pumpkin sponsor inquiries",
  },
  {
    label: "Newsletter signups",
    inbox: "outreach@lcautism.org",
    note: "Stay-in-the-loop band — every page footer",
  },
  {
    label: "Events RSVP submissions",
    inbox: "outreach@lcautism.org",
    note: "Events page modal RSVPs",
  },
];

const PROGRAMS = [
  {
    id: "smart",
    name: "SMART Program",
    audience: "Neurodiverse adults pursuing independence",
    summary: "Skill-building and connection programming for adults in Lewis County living with autism, developmental disabilities, and neurodiverse identities. Built around peer mentoring, life-skills, and community participation.",
    pageHref: "https://lcautism-coalition.vercel.app/pages/smart.html",
    editFile: "public/sites/lcac/pages/smart.html",
    icon: "🌟",
  },
  {
    id: "sdcc",
    name: "Spectrum & Development Center",
    audience: "Families + individuals in Napavine",
    summary: "The coalition's home base — a sensory-friendly community space at 375 Linhart Ave NE in Napavine. Hosts coalition meetings, parent groups, teen + adult connection groups, drop-in family support, and Art with Krystian.",
    pageHref: "https://lcautism-coalition.vercel.app/pages/sdcc.html",
    editFile: "public/sites/lcac/pages/sdcc.html",
    icon: "🏠",
  },
  {
    id: "services",
    name: "Groups & Services",
    audience: "DSHS / DDCS-eligible individuals + caregivers",
    summary: "DSHS/DDCS-contracted Respite in the Community + recreational opportunities for families on the Home & Community Based waiver. Real respite for caregivers, real participation for clients.",
    pageHref: "https://lcautism-coalition.vercel.app/pages/services.html",
    editFile: "public/sites/lcac/pages/services.html",
    icon: "🤝",
  },
  {
    id: "events",
    name: "Coalition Meetings & Events",
    audience: "Whole community — members, partners, families",
    summary: "Monthly coalition meetings at the S&D Center open to anyone. Plus seasonal events — BMX show, Santa visit, Teal Pumpkin Project, art workshops, Parent Empowerment Series.",
    pageHref: "https://lcautism-coalition.vercel.app/pages/events.html",
    editFile: "public/sites/lcac/js/events-data.js",
    icon: "🎈",
  },
  {
    id: "statewide",
    name: "Statewide Collaboration",
    audience: "WA rural autism families + policy advocates",
    summary: "Making sure rural Lewis County voices are part of statewide autism policy, research, and advocacy. We're the only autism coalition serving south-Olympia Washington.",
    pageHref: "https://lcautism-coalition.vercel.app/pages/statewide.html",
    editFile: "public/sites/lcac/pages/statewide.html",
    icon: "🗺️",
  },
];

const UPCOMING_EVENTS = [
  { title: "Coalition Meeting",                  when: "Mar/Apr/May, 5:30–8:00 PM",   where: "S&D Center, Napavine" },
  { title: "Parent Empowerment Series",          when: "Multi-week, 5:30–7:00 PM",    where: "S&D Center (+ online)" },
  { title: "Teen Neurodiverse Connections",      when: "Monthly, 4:00–5:00 PM",       where: "Salkum Library" },
  { title: "Adult Neurodiverse Connections",     when: "Monthly, 12:00–1:00 PM",      where: "S&D Center, Napavine" },
  { title: "Art with Krystian",                  when: "Monthly art workshop",        where: "S&D Center, Napavine" },
];

export default function LCACOwnerPortal() {
  const [tab, setTab] = useState<TabId>("today");

  return (
    <main style={pageWrap}>
      <header style={headerStyle}>
        <div style={headerInner}>
          <div>
            <p style={kicker}>Owner Portal · Lewis County Autism Coalition</p>
            <h1 style={h1}>Welcome, Michelle.</h1>
            <p style={subhead}>
              Your one-page dashboard for the coalition — programs, events, inboxes, and how to edit anything yourself.
            </p>
          </div>
          <Link href="https://lcautism-coalition.vercel.app/" target="_blank" style={primaryBtn}>
            ↗ Open the live site
          </Link>
        </div>

        <nav style={tabBar} role="tablist" aria-label="Portal sections">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                style={{
                  ...tabBtn,
                  background: active ? ACCENT : "white",
                  color: active ? "white" : "#44403c",
                  borderColor: active ? ACCENT : "#e7e5e4",
                }}
              >
                <span style={{ fontSize: 15 }}>{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      <div style={container}>
        {tab === "today" && <TodayTab />}
        {tab === "programs" && <ProgramsTab />}
        {tab === "events" && <EventsTab />}
        {tab === "inbox" && <InboxTab />}
        {tab === "edit" && <EditTab />}
        {tab === "future" && <FutureTab />}

        <footer style={{ paddingTop: 24, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 12, color: "#78716c" }}>
            Built by BlueJays for Michelle Whitlow and the Lewis County Autism Coalition · Questions? Text Ben.
          </p>
        </footer>
      </div>
    </main>
  );
}

/* ─────────────────────────── TABS ─────────────────────────── */

function TodayTab() {
  return (
    <>
      {/* Site status + DNS heads-up */}
      <section style={cardLight()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p style={smallLabel}>Your Site</p>
            <h2 style={h2}>Built & live on the BlueJays stack</h2>
            <p style={lead}>
              The new site you and Ben built together is fully live at <strong>lcautism-coalition.vercel.app</strong>. Pages, forms, search, mobile — all working.
            </p>
          </div>
          <span style={pill("#10b981", "#ecfdf5")}>● Healthy</span>
        </div>

        <div style={amberBox}>
          <p style={{ margin: 0, fontSize: 13, color: "#92400e", fontWeight: 700 }}>
            ⚠ Heads-up: lcautism.org still points at the old Wix site
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#78350f", lineHeight: 1.5 }}>
            Visitors typing lcautism.org are still seeing Wix. The new site is ready &mdash; the address change just hasn&apos;t happened yet. When you&apos;re ready, text Ben (he handles the flip from his side, ~30 minutes plus DNS propagation).
          </p>
        </div>
      </section>

      {/* At-a-glance: 3 KPI tiles */}
      <div style={tilesGrid}>
        <KpiTile emoji="📨" big="5" label="Form inboxes wired" detail="Contact, Volunteer, Sponsor, Newsletter, Events RSVP" tone="teal" />
        <KpiTile emoji="🎯" big="5" label="Active programs" detail="SMART · S&D Center · Services · Events · Statewide" tone="amber" />
        <KpiTile emoji="📅" big="5+" label="Recurring event series" detail="Coalition Meetings · Parent series · Teen + Adult groups · Art" tone="teal" />
      </div>

      {/* Quick actions */}
      <section style={cardLight()}>
        <p style={smallLabel}>Things you can do right now</p>
        <h2 style={h2}>Quick actions</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 12 }}>
          <ActionCard
            emoji="📅"
            title="Add or edit an event"
            description="The Events admin lets you publish new events without code."
            href="https://lcautism-coalition.vercel.app/pages/admin.html"
          />
          <ActionCard
            emoji="📨"
            title="Check what came in"
            description="Open your Gmail inboxes — every form submission lands there."
            href="https://mail.google.com/"
          />
          <ActionCard
            emoji="✏️"
            title="Edit the site"
            description="Open Claude Code on your computer and say what you want changed in plain English."
            href="#"
          />
          <ActionCard
            emoji="💬"
            title="Text Ben"
            description="Anything weird, anything missing, anything you want — one text away."
            href="sms:+13606445222"
          />
        </div>
      </section>
    </>
  );
}

function ProgramsTab() {
  return (
    <>
      <section style={cardLight()}>
        <p style={smallLabel}>What the coalition delivers</p>
        <h2 style={h2}>Your programs</h2>
        <p style={lead}>
          These are the five surfaces where LCAC creates value for autistic individuals, neurodiverse families, and the broader Lewis County community. Each card links to the live page on your site so you can verify the public version, and tells you exactly where to make edits.
        </p>
      </section>

      {PROGRAMS.map((p) => (
        <section key={p.id} style={cardLight()}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: `${ACCENT}14`, display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0,
            }}>
              {p.icon}
            </div>
            <div style={{ flex: "1 1 280px", minWidth: 0 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#0c0a09", letterSpacing: "-0.01em" }}>
                {p.name}
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: ACCENT, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Who it serves · {p.audience}
              </p>
              <p style={{ margin: "10px 0 0", fontSize: 14, color: "#44403c", lineHeight: 1.6 }}>
                {p.summary}
              </p>
              <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Link href={p.pageHref} target="_blank" style={smallPrimaryBtn}>
                  View live page ↗
                </Link>
                <span style={smallMonoTag} title="The file Claude Code should open when you ask to edit this program">
                  edit: {p.editFile}
                </span>
              </div>
            </div>
          </div>
        </section>
      ))}

      <section style={{ ...cardLight(), background: ACCENT_SOFT, borderColor: "#fcd34d" }}>
        <p style={{ margin: 0, fontSize: 13, color: "#78350f", lineHeight: 1.6 }}>
          <strong>Tip:</strong> When you want to change anything on one of these program pages, open Claude Code and say e.g. <em>&quot;On the SMART program page, add a sentence about the new Tuesday support group.&quot;</em> Claude reads your CLAUDE.md, opens the right file, shows the diff, and pushes when you say yes.
        </p>
      </section>
    </>
  );
}

function EventsTab() {
  return (
    <>
      <section style={cardLight()}>
        <p style={smallLabel}>What&apos;s on the calendar</p>
        <h2 style={h2}>Events & coalition meetings</h2>
        <p style={lead}>
          The events list on your site is driven by a simple data file. You can manage it through the admin panel <em>(no code)</em> or ask Claude Code to add/edit an event directly.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          <Link href="https://lcautism-coalition.vercel.app/pages/admin.html" target="_blank" style={smallPrimaryBtn}>
            Open Events Admin ↗
          </Link>
          <Link href="https://lcautism-coalition.vercel.app/pages/events.html" target="_blank" style={smallSecondaryBtn}>
            View public events page ↗
          </Link>
        </div>
      </section>

      <section style={cardLight()}>
        <p style={smallLabel}>Recurring this season</p>
        <h2 style={h2}>What people are showing up for</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0" }}>
          {UPCOMING_EVENTS.map((e) => (
            <li key={e.title} style={eventRow}>
              <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 700, color: "#0c0a09", fontSize: 14 }}>{e.title}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#78716c" }}>{e.when} · {e.where}</p>
              </div>
              <span style={pill(ACCENT, `${ACCENT}14`)}>Active</span>
            </li>
          ))}
        </ul>
        <p style={{ margin: "12px 0 0", fontSize: 12, color: "#78716c", fontStyle: "italic" }}>
          Exact dates live on the public events page and refresh whenever you publish a new event through the admin panel.
        </p>
      </section>
    </>
  );
}

function InboxTab() {
  return (
    <>
      <section style={cardLight()}>
        <p style={smallLabel}>What&apos;s coming in</p>
        <h2 style={h2}>Form submissions from the website</h2>
        <p style={lead}>
          Every form on the site sends an email to one of your inboxes through a free service called Web3Forms. Here&apos;s where each one goes &mdash; check the matching inbox to see what&apos;s come in.
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0" }}>
          {FORM_INBOXES.map((f) => (
            <li key={f.label} style={inboxRow}>
              <div style={{ minWidth: 0, flex: "1 1 240px" }}>
                <p style={{ margin: 0, fontWeight: 700, color: "#0c0a09", fontSize: 14 }}>{f.label}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#78716c" }}>{f.note}</p>
              </div>
              <a href={`mailto:${f.inbox}`} style={smallPrimaryBtn}>
                Open {f.inbox}
              </a>
            </li>
          ))}
        </ul>
        <p style={{ margin: "12px 0 0", fontSize: 12, color: "#78716c", fontStyle: "italic" }}>
          Tip: in Gmail you can filter messages by sender (BlueJays) and label them &quot;Website&quot; so they land in one folder. Ask Ben if you&apos;d like him to set that up for you.
        </p>
      </section>
    </>
  );
}

function EditTab() {
  return (
    <>
      <section style={cardLight()}>
        <p style={smallLabel}>Making changes to the site</p>
        <h2 style={h2}>You can change anything in plain English</h2>
        <p style={lead}>
          The website lives in a folder on your computer. To make any change &mdash; new event date, swap a photo, fix a typo, add a new staff bio &mdash; you open that folder in <strong>Claude Code</strong> (the program installed on your machine) and just <em>tell it what you want</em>.
        </p>
        <p style={lead}>
          Claude reads your CLAUDE.md instructions, asks you to confirm before changing anything, and pushes the change live when you say yes.
        </p>
        <ol style={{ margin: "12px 0 0", paddingLeft: 20, fontSize: 13, color: "#44403c", lineHeight: 1.85 }}>
          <li>Open Terminal &rarr; type <code style={codeStyle}>cd ~/Desktop/lcautism-coalition</code> (or wherever Ben put it)</li>
          <li>Type <code style={codeStyle}>claude</code> and hit enter</li>
          <li>Say what you want in plain English — examples below</li>
          <li>Claude shows you the change &rarr; you say &quot;yes, push it live&quot; &rarr; it&apos;s live in about 60 seconds</li>
        </ol>
        <p style={{ margin: "14px 0 0", fontSize: 12, color: "#78716c", fontStyle: "italic" }}>
          If something goes wrong, text Ben &mdash; never anything to fear, the worst case is one undone push.
        </p>
      </section>

      <section style={cardLight()}>
        <p style={smallLabel}>Example phrases that work</p>
        <h2 style={h2}>Ask Claude like a coworker</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0", display: "grid", gap: 8 }}>
          {[
            "Change the coalition meeting date to June 25 on the events page",
            "Add a new staff bio for Sarah Jenkins to the Our Story page",
            "Fix the typo on the SMART program page — it says 'recieve' instead of 'receive'",
            "The S&D Center photo on the homepage is wrong, swap it with assets/images/sdcc-front.jpg",
            "Add a third support group to the Adult Connections section",
            "Change the donate page mailing address from PMB #240 to PMB #241",
          ].map((q) => (
            <li key={q} style={exampleChip}>
              <span style={{ color: ACCENT, fontWeight: 800 }}>&ldquo;</span>
              {q}
              <span style={{ color: ACCENT, fontWeight: 800 }}>&rdquo;</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function FutureTab() {
  return (
    <section style={{
      ...cardLight(),
      background: `linear-gradient(135deg, rgba(13,148,136,0.06), rgba(245,158,11,0.05))`,
      borderColor: `${ACCENT}33`,
    }}>
      <p style={smallLabel}>Preview · what the next level could feel like</p>
      <h2 style={h2}>The Mission Dashboard</h2>
      <p style={lead}>
        BlueJays builds dashboards for organizations that want to see every supporter, every donor, every community partner &mdash; scored, mapped, in pipelines &mdash; in one place. We&apos;ve mocked up what one would look like for LCAC.
      </p>
      <p style={lead}>
        <em>Mock data only.</em> The real version would require connecting forms + a donation processor + a volunteer tracker to a database. Not part of your $100/yr custom tier &mdash; just a glimpse of what&apos;s possible if LCAC decides it wants more from its website.
      </p>
      <div style={{ marginTop: 14 }}>
        <Link href="/clients/lewis-county-autism/portal-demo" style={primaryBtn}>
          Open the dashboard preview &rarr;
        </Link>
        <span style={{ marginLeft: 12, fontSize: 11, color: "#78716c", fontFamily: "monospace" }}>
          demo code: 1212
        </span>
      </div>
    </section>
  );
}

/* ─────────────────────────── PRIMITIVES ─────────────────────────── */

function ActionCard({ emoji, title, description, href }: {
  emoji: string; title: string; description: string; href: string;
}) {
  const Cmp: React.ElementType = href.startsWith("#") ? "div" : "a";
  return (
    <Cmp
      href={href.startsWith("#") ? undefined : href}
      target={href.startsWith("http") ? "_blank" : undefined}
      style={{
        display: "block",
        padding: 14,
        background: "white",
        border: "1px solid #e7e5e4",
        borderRadius: 10,
        textDecoration: "none",
        color: "inherit",
        cursor: href.startsWith("#") ? "default" : "pointer",
      }}
    >
      <p style={{ margin: 0, fontSize: 22 }}>{emoji}</p>
      <p style={{ margin: "6px 0 0", fontWeight: 700, color: "#0c0a09", fontSize: 14 }}>{title}</p>
      <p style={{ margin: "4px 0 0", fontSize: 12, color: "#57534e", lineHeight: 1.5 }}>{description}</p>
    </Cmp>
  );
}

function KpiTile({ emoji, big, label, detail, tone }: {
  emoji: string; big: string; label: string; detail: string; tone: "teal" | "amber";
}) {
  const fg = tone === "teal" ? ACCENT : "#b45309";
  const bg = tone === "teal" ? "rgba(13,148,136,0.05)" : "rgba(245,158,11,0.06)";
  const border = tone === "teal" ? `${ACCENT}33` : "rgba(245,158,11,0.3)";
  return (
    <div style={{
      background: bg, border: `1px solid ${border}`,
      borderRadius: 14, padding: 16,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 22 }}>{emoji}</span>
        <span style={{ fontSize: 32, fontWeight: 800, color: fg, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}>
          {big}
        </span>
      </div>
      <p style={{ margin: "10px 0 0", fontWeight: 700, fontSize: 13, color: "#0c0a09" }}>{label}</p>
      <p style={{ margin: "2px 0 0", fontSize: 11, color: "#78716c", lineHeight: 1.5 }}>{detail}</p>
    </div>
  );
}

/* ─────────────────────────── STYLES ─────────────────────────── */

const pageWrap: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #fafaf9 0%, #fff8f0 100%)",
  color: "#0c0a09",
  fontFamily: "'Inter', system-ui, sans-serif",
};

const headerStyle: React.CSSProperties = {
  background: "white",
  borderBottom: "1px solid #e7e5e4",
};

const headerInner: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "1.25rem 1.25rem 1rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap",
};

const tabBar: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "0 1.25rem 14px",
  display: "flex",
  gap: 6,
  flexWrap: "wrap",
};

const tabBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 14px",
  borderRadius: 10,
  border: "1px solid #e7e5e4",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.15s ease",
  fontFamily: "inherit",
  lineHeight: 1.2,
};

const container: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "1.5rem 1.25rem 3rem",
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const kicker: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "#78716c",
  fontWeight: 700,
};

const h1: React.CSSProperties = {
  margin: "4px 0 0",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: 26,
  color: "#0c0a09",
  letterSpacing: "-0.01em",
};

const subhead: React.CSSProperties = {
  margin: "4px 0 0",
  fontSize: 13,
  color: "#57534e",
};

const h2: React.CSSProperties = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: 20,
  color: "#0c0a09",
  margin: "4px 0 0",
  letterSpacing: "-0.01em",
};

const lead: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 14,
  color: "#44403c",
  lineHeight: 1.6,
};

const smallLabel: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "#78716c",
  fontWeight: 700,
};

const primaryBtn: React.CSSProperties = {
  display: "inline-block",
  padding: "9px 16px",
  background: ACCENT,
  color: "white",
  borderRadius: 10,
  fontWeight: 700,
  fontSize: 13,
  textDecoration: "none",
};

const smallPrimaryBtn: React.CSSProperties = {
  display: "inline-block",
  fontSize: 12,
  fontWeight: 700,
  color: "white",
  background: ACCENT,
  padding: "6px 12px",
  borderRadius: 8,
  textDecoration: "none",
  whiteSpace: "nowrap",
};

const smallSecondaryBtn: React.CSSProperties = {
  display: "inline-block",
  fontSize: 12,
  fontWeight: 700,
  color: "#44403c",
  background: "white",
  border: "1px solid #e7e5e4",
  padding: "6px 12px",
  borderRadius: 8,
  textDecoration: "none",
  whiteSpace: "nowrap",
};

const smallMonoTag: React.CSSProperties = {
  display: "inline-block",
  fontSize: 11,
  fontFamily: "monospace",
  color: "#78716c",
  background: "#f5f5f4",
  padding: "5px 9px",
  borderRadius: 6,
  border: "1px solid #e7e5e4",
};

const codeStyle: React.CSSProperties = {
  background: "#fef3c7",
  color: "#92400e",
  padding: "1px 6px",
  borderRadius: 4,
  fontFamily: "monospace",
  fontSize: 12,
};

const amberBox: React.CSSProperties = {
  marginTop: 14,
  padding: 14,
  background: "rgba(245,158,11,0.08)",
  border: "1px solid rgba(245,158,11,0.3)",
  borderRadius: 10,
};

const tilesGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
};

const eventRow: React.CSSProperties = {
  padding: "10px 0",
  borderTop: "1px solid #e7e5e4",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};

const inboxRow: React.CSSProperties = {
  padding: "10px 0",
  borderTop: "1px solid #e7e5e4",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};

const exampleChip: React.CSSProperties = {
  padding: "10px 14px",
  background: "#fafaf9",
  border: "1px solid #e7e5e4",
  borderRadius: 10,
  fontSize: 13,
  color: "#44403c",
  lineHeight: 1.55,
  fontStyle: "italic",
};

function cardLight(extra: React.CSSProperties = {}): React.CSSProperties {
  return {
    background: "white",
    border: "1px solid #e7e5e4",
    borderRadius: 14,
    padding: 20,
    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
    ...extra,
  };
}

function pill(fg: string, bg: string): React.CSSProperties {
  return {
    padding: "3px 10px",
    fontSize: 11,
    fontWeight: 700,
    color: fg,
    background: bg,
    borderRadius: 999,
    border: `1px solid ${fg}33`,
    whiteSpace: "nowrap",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  };
}
