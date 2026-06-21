"use client";

import { useEffect, useMemo, useState } from "react";
import {
  C, Card, Btn, Loading, Empty, SectionTitle, fmtDateTime, fmtDate, SERIF,
} from "./ui";

type ContactForm = {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  message: string | null;
  service_requested: string | null;
  submitted_at: string;
};
type MissedCall = {
  id: string;
  caller_phone: string | null;
  caller_name: string | null;
  duration_seconds: number | null;
  auto_sms_sent: boolean | null;
  called_at: string;
};
type EmailRow = { email: string; name: string | null; lastSeen: string };

export default function RequestsTab() {
  const [forms, setForms] = useState<ContactForm[]>([]);
  const [calls, setCalls] = useState<MissedCall[]>([]);
  const [emails, setEmails] = useState<EmailRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const j = await fetch("/api/clients/kr-ranches/customers", { credentials: "include" }).then((r) => r.json());
        if (j.ok) {
          setForms(j.contactForms || []);
          setCalls(j.missedCalls || []);
          setEmails(j.emailList || []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const waitlist = useMemo(() => forms.filter((f) => f.service_requested === "drop-alert-waitlist"), [forms]);
  const requests = useMemo(() => forms.filter((f) => f.service_requested !== "drop-alert-waitlist"), [forms]);

  const csvUrl = useMemo(() => {
    if (emails.length === 0) return null;
    const csv = "email,name,last_seen\n" + emails.map((e) =>
      `"${e.email}","${(e.name || "").replace(/"/g, '""')}","${e.lastSeen}"`).join("\n");
    return "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  }, [emails]);

  if (loading) return <Loading />;

  return (
    <div>
      <SectionTitle sub="Order requests from your website, drop-alert signups, missed calls, and your full email list.">
        Requests &amp; inbox
      </SectionTitle>

      {/* email export banner */}
      <Card style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div>
          <strong style={{ fontFamily: SERIF, fontSize: 16 }}>Email list</strong>
          <div style={{ fontSize: 12, color: C.muted }}>{emails.length} contacts captured — export for Mailchimp, etc.</div>
        </div>
        {csvUrl ? (
          <a href={csvUrl} download="kr-ranches-emails.csv" style={{ textDecoration: "none" }}>
            <Btn>Download CSV ({emails.length})</Btn>
          </a>
        ) : <span style={{ fontSize: 12, color: C.muted }}>No emails yet.</span>}
      </Card>

      {/* order requests */}
      <Section title={`Website order requests (${requests.length})`} empty="No order requests yet. They arrive here when someone fills out the “Send Order Request” form on your site.">
        {requests.map((f) => (
          <Card key={f.id} pad={14}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <strong style={{ fontFamily: SERIF, fontSize: 16, color: C.ink2 }}>{f.customer_name || "Anonymous"}</strong>
              <span style={{ fontSize: 11, color: C.muted }}>{fmtDateTime(f.submitted_at)}</span>
            </div>
            <div style={{ fontSize: 13, color: C.ink2, marginTop: 4, display: "flex", gap: 12, flexWrap: "wrap" }}>
              {f.customer_phone && <a href={`tel:${f.customer_phone}`} style={{ color: C.red }}>📞 {f.customer_phone}</a>}
              {f.customer_email && <a href={`mailto:${f.customer_email}`} style={{ color: C.red }}>✉️ {f.customer_email}</a>}
            </div>
            {f.service_requested && <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>Interested in: {f.service_requested}</div>}
            {f.message && <div style={{ fontSize: 13, color: C.ink2, marginTop: 6, lineHeight: 1.5 }}>{f.message}</div>}
          </Card>
        ))}
      </Section>

      {/* waitlist */}
      <Section title={`Freezer drop-alert waitlist (${waitlist.length})`} empty="No one on the drop-alert waitlist yet.">
        {waitlist.map((f) => (
          <div key={f.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 4px", borderBottom: `1px solid ${C.lineSoft}`, fontSize: 13 }}>
            <a href={`mailto:${f.customer_email}`} style={{ color: C.red, fontWeight: 600 }}>{f.customer_email}</a>
            <span style={{ color: C.muted, fontSize: 11 }}>{fmtDate(f.submitted_at)}</span>
          </div>
        ))}
      </Section>

      {/* missed calls */}
      <Section title={`Missed calls (${calls.length})`} empty="No missed calls logged. (Shows up if your business line is wired to the missed-call auto-texter.)">
        {calls.map((m) => (
          <Card key={m.id} pad={12}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <strong style={{ color: C.ink2 }}>{m.caller_name || m.caller_phone || "Unknown caller"}</strong>
              <span style={{ fontSize: 11, color: C.muted }}>{fmtDateTime(m.called_at)}</span>
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
              {m.caller_phone && <a href={`tel:${m.caller_phone}`} style={{ color: C.red }}>{m.caller_phone}</a>}
              {m.auto_sms_sent ? " · ✓ auto-text sent" : ""}
            </div>
          </Card>
        ))}
      </Section>
    </div>
  );
}

function Section({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const arr = Array.isArray(children) ? children : [children];
  const isEmpty = arr.flat().filter(Boolean).length === 0;
  return (
    <div style={{ marginBottom: 26 }}>
      <h3 style={{ fontFamily: "Impact, sans-serif", fontSize: 14, letterSpacing: "0.06em", textTransform: "uppercase", color: C.ink2, margin: "0 0 10px", paddingBottom: 6, borderBottom: `2px solid rgba(157,48,48,0.25)` }}>
        {title}
      </h3>
      {isEmpty ? <Empty>{empty}</Empty> : <div style={{ display: "grid", gap: 8 }}>{children}</div>}
    </div>
  );
}
