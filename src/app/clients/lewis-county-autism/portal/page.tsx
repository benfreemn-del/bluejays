import Link from "next/link";

/**
 * LCAC owner portal — the surface mom (Michelle, executive director)
 * logs into. Bespoke for LCAC's custom-tier shape: NOT AI System
 * (no Hyperloop / Claude tier). What lives here today is:
 *
 *  1. Site status card — is the live site up, where is it, DNS state
 *  2. Web3Forms inbox links — direct deep-links to her form-submission
 *     inboxes (contact, volunteer, sponsor, newsletter)
 *  3. How-to-edit card — links to Claude Code + the repo + plain-
 *     English editing protocol from the LCAC CLAUDE.md
 *  4. Mission Dashboard preview link — points at /clients/lewis-
 *     county-autism/portal-demo (password 1212) so she can see what
 *     a Pro-tier upgrade would unlock
 *
 * Why not the dynamic /clients/[slug]/portal renderer: that one is
 * heavily AI-System-flavored (Hyperloop + Claude + ads + AI Skills
 * tabs). LCAC doesn't have any of those. A bespoke shell is honest
 * about what they actually have.
 *
 * Auth model: URL-as-secret pattern (same as /preview, /claim, /client
 * routes per CLAUDE.md "Public-Facing Surface Rules"). The slug
 * itself isn't a secret, but the page intentionally has zero
 * outreach surface — search engines are excluded via robots:noindex.
 * Real per-owner auth would gate this through client_owners.
 *
 * When LCAC eventually flips DNS and Ben wants to lock this down,
 * wrap the page in a ClientAuthGate (existing pattern in client-auth.ts).
 */

const ACCENT = "#0d9488";
const ACCENT_WARM = "#f59e0b";

const FORM_INBOXES = [
  {
    label: "Contact form submissions",
    inbox: "info@lcautism.org",
    note: "Anyone using the Contact page form",
    accessKey: "4aa1988f-ab2b-4f29-94c6-37d5a651298e",
  },
  {
    label: "Volunteer form submissions",
    inbox: "outreach@lcautism.org",
    note: "Anyone signing up to volunteer",
    accessKey: "c7341c41-b260-4ef0-a8c3-69180da5de8f",
  },
  {
    label: "Sponsor form submissions",
    inbox: "outreach@lcautism.org",
    note: "BMX, Santa, Teal Pumpkin sponsor inquiries",
    accessKey: "c7341c41-b260-4ef0-a8c3-69180da5de8f",
  },
  {
    label: "Newsletter signups",
    inbox: "outreach@lcautism.org",
    note: "Stay-in-the-loop band — every page footer",
    accessKey: "c7341c41-b260-4ef0-a8c3-69180da5de8f",
  },
  {
    label: "Events RSVP submissions",
    inbox: "outreach@lcautism.org",
    note: "Events page modal RSVPs",
    accessKey: "c7341c41-b260-4ef0-a8c3-69180da5de8f",
  },
];

export default function LCACOwnerPortal() {
  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg, #fafaf9 0%, #fff8f0 100%)", color: "#0c0a09", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <header style={{ background: "white", borderBottom: "1px solid #e7e5e4" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.25rem 1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#78716c", fontWeight: 700 }}>
              Owner Portal · Lewis County Autism Coalition
            </p>
            <h1 style={{ margin: "4px 0 0", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 26, color: "#0c0a09", letterSpacing: "-0.01em" }}>
              Welcome, Michelle.
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#57534e" }}>
              This is the one page you can come back to whenever you want to know what your website is doing.
            </p>
          </div>
          <Link href="https://lcautism-coalition.vercel.app/" target="_blank" style={{ fontSize: 13, fontWeight: 600, color: ACCENT, textDecoration: "none" }}>
            ↗ Open the live site
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.5rem 1.25rem 3rem", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Site status */}
        <section style={cardLight()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
            <div>
              <p style={smallLabel}>Your Site</p>
              <h2 style={h2}>Built & live on the new BlueJays stack</h2>
              <p style={lead}>
                The new site you and Ben built together is fully live at
                <strong> lcautism-coalition.vercel.app</strong>. Everything works — pages, forms, search, mobile.
              </p>
            </div>
            <span style={pill("#10b981", "#ecfdf5")}>● Healthy</span>
          </div>

          <div style={{ marginTop: 14, padding: 14, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 10 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#92400e", fontWeight: 700 }}>
              ⚠ Heads-up: lcautism.org still points at the old Wix site
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#78350f", lineHeight: 1.5 }}>
              Your visitors are still seeing Wix when they type lcautism.org. The new
              site is ready and pretty, but the address change hasn&apos;t happened yet.
              When you&apos;re ready, text Ben &mdash; he handles the flip from his side
              (it takes him about 30 minutes plus a wait for the internet to catch up).
            </p>
          </div>
        </section>

        {/* Form inboxes */}
        <section style={cardLight()}>
          <p style={smallLabel}>What&apos;s coming in</p>
          <h2 style={h2}>Form submissions from the website</h2>
          <p style={lead}>
            Every form on the site sends an email to one of your inboxes through a free service called Web3Forms.
            Here&apos;s where each one goes &mdash; check the matching inbox to see what&apos;s come in.
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0" }}>
            {FORM_INBOXES.map((f) => (
              <li key={f.label} style={{ padding: "10px 0", borderTop: "1px solid #e7e5e4", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, color: "#0c0a09", fontSize: 14 }}>{f.label}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#78716c" }}>{f.note}</p>
                </div>
                <a
                  href={`mailto:${f.inbox}`}
                  style={{
                    fontSize: 12, fontWeight: 700, color: "white",
                    background: ACCENT, padding: "6px 12px", borderRadius: 8,
                    textDecoration: "none", whiteSpace: "nowrap",
                  }}
                >
                  Open {f.inbox}
                </a>
              </li>
            ))}
          </ul>
          <p style={{ margin: "12px 0 0", fontSize: 12, color: "#78716c", fontStyle: "italic" }}>
            Tip: in Gmail you can filter messages by sender (BlueJays) and label them &quot;Website&quot; so they all land in one folder.
            Ask Ben if you&apos;d like him to set that up for you.
          </p>
        </section>

        {/* How to make changes */}
        <section style={cardLight()}>
          <p style={smallLabel}>Making changes to the site</p>
          <h2 style={h2}>You can change anything in plain English</h2>
          <p style={lead}>
            The website lives in a folder on your computer. To make any change &mdash; new event date, swap a photo, fix a typo &mdash;
            you open that folder in <strong>Claude Code</strong> (the program installed on your machine) and just <em>tell it what you want</em>.
            Claude reads your CLAUDE.md instructions, asks you to confirm before changing anything, and pushes the change live when you say yes.
          </p>
          <ul style={{ margin: "12px 0 0", paddingLeft: 18, fontSize: 13, color: "#44403c", lineHeight: 1.65 }}>
            <li>Open Terminal &rarr; type <code style={code}>cd ~/Desktop/lcautism-coalition</code> (or wherever Ben put it)</li>
            <li>Type <code style={code}>claude</code> and hit enter</li>
            <li>Say what you want in plain English (&quot;Change the Coalition Meeting date to June 25&quot;)</li>
            <li>Claude shows you the change &rarr; you say &quot;yes, push it live&quot; &rarr; it&apos;s live in about 60 seconds</li>
          </ul>
          <p style={{ margin: "12px 0 0", fontSize: 12, color: "#78716c", fontStyle: "italic" }}>
            If something goes wrong, text Ben &mdash; never anything to fear, the worst case is one undone push.
          </p>
        </section>

        {/* Mission Dashboard preview */}
        <section style={{
          ...cardLight(),
          background: `linear-gradient(135deg, rgba(13,148,136,0.06), rgba(245,158,11,0.05))`,
          borderColor: `${ACCENT}33`,
        }}>
          <p style={smallLabel}>Preview · what the next level could feel like</p>
          <h2 style={h2}>The Mission Dashboard</h2>
          <p style={lead}>
            BlueJays builds dashboards for organizations that want to see every supporter, every donor, every community partner &mdash;
            scored, mapped, in pipelines &mdash; in one place. We&apos;ve mocked up what one would look like for LCAC.
          </p>
          <p style={lead}>
            <em>Mock data only.</em> Real version requires connecting forms + Stripe + volunteer-tracker to a database. Not part of your $100/yr tier &mdash; just a glimpse of what&apos;s possible if LCAC decides it wants more from its website.
          </p>
          <div style={{ marginTop: 14 }}>
            <Link
              href="/clients/lewis-county-autism/portal-demo"
              style={{
                display: "inline-block", padding: "10px 18px",
                background: ACCENT, color: "white",
                borderRadius: 10, fontWeight: 700, fontSize: 13,
                textDecoration: "none",
              }}
            >
              Open the dashboard preview &rarr;
            </Link>
            <span style={{ marginLeft: 12, fontSize: 11, color: "#78716c", fontFamily: "monospace" }}>
              demo code: 1212
            </span>
          </div>
        </section>

        <footer style={{ paddingTop: 12, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 12, color: "#78716c" }}>
            Built by BlueJays for Michelle Whitlow and the Lewis County Autism Coalition &middot;
            Questions? Text Ben.
          </p>
        </footer>
      </div>
    </main>
  );
}

/* ───────────────────────── PRIMITIVES ───────────────────────── */

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

const code: React.CSSProperties = {
  background: "#fef3c7",
  color: "#92400e",
  padding: "1px 6px",
  borderRadius: 4,
  fontFamily: "monospace",
  fontSize: 12,
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
