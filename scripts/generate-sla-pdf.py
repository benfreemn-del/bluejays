"""
Generate BlueJays Service-Level Agreement PDF.

Output: bluejays/public/onboarding/bluejays-sla.pdf — shared across every
AI System ($10k tier) client. Web-accessible at
https://bluejayportfolio.com/onboarding/bluejays-sla.pdf and from local
dev at http://localhost:PORT/onboarding/bluejays-sla.pdf

Registered in src/lib/onboard-docs.ts for each AI System slug so the
client receives /sign/[slug]/sla and gets the same numbers.

Re-run from repo root:
    py scripts/generate-sla-pdf.py
"""

from __future__ import annotations

from pathlib import Path
from datetime import date

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate,
    Flowable,
    Frame,
    HRFlowable,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


NAVY = colors.HexColor("#0a0f1e")
NAVY_LIGHT = colors.HexColor("#1a2438")
INK = colors.HexColor("#0f172a")
SLATE = colors.HexColor("#475569")
LIGHT = colors.HexColor("#f8fafc")
SKY = colors.HexColor("#0ea5e9")
LIME = colors.HexColor("#84cc16")
AMBER = colors.HexColor("#f59e0b")
ROSE = colors.HexColor("#e11d48")
WHITE = colors.white


ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "onboarding"
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT_FILE = OUT_DIR / "bluejays-sla.pdf"


styles = getSampleStyleSheet()

TITLE = ParagraphStyle(
    "Title", parent=styles["Title"],
    fontSize=26, leading=30, textColor=INK, alignment=TA_LEFT,
    fontName="Helvetica-Bold", spaceAfter=4,
)
SUBTITLE = ParagraphStyle(
    "Subtitle", parent=styles["Normal"],
    fontSize=11, leading=14, textColor=SLATE, alignment=TA_LEFT,
    spaceAfter=12,
)
H2 = ParagraphStyle(
    "H2", parent=styles["Heading2"],
    fontSize=14, leading=18, textColor=INK,
    fontName="Helvetica-Bold", spaceBefore=14, spaceAfter=6,
)
H3 = ParagraphStyle(
    "H3", parent=styles["Heading3"],
    fontSize=11, leading=15, textColor=SKY,
    fontName="Helvetica-Bold", spaceBefore=10, spaceAfter=4,
)
BODY = ParagraphStyle(
    "Body", parent=styles["Normal"],
    fontSize=10, leading=14, textColor=INK,
    spaceAfter=6,
)
BODY_HEAD = ParagraphStyle(
    "BodyHead", parent=styles["Normal"],
    fontSize=10, leading=14, textColor=WHITE,
    fontName="Helvetica-Bold", spaceAfter=0,
)
SMALL = ParagraphStyle(
    "Small", parent=styles["Normal"],
    fontSize=9, leading=12, textColor=SLATE,
    spaceAfter=4,
)
CHIP = ParagraphStyle(
    "Chip", parent=styles["Normal"],
    fontSize=9, leading=11, textColor=WHITE,
    fontName="Helvetica-Bold", alignment=TA_CENTER,
)


def chip(text: str, bg=SKY) -> Table:
    """Small colored badge."""
    t = Table([[Paragraph(text, CHIP)]], colWidths=[1.4 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("ROUNDEDCORNERS", [6, 6, 6, 6]),
    ]))
    return t


def commitment_table(rows):
    """Two-column commitment table: lane | response window."""
    data = [
        [Paragraph("Channel / scenario", BODY_HEAD),
         Paragraph("Our commitment", BODY_HEAD)],
    ]
    for left, right in rows:
        data.append([Paragraph(left, BODY), Paragraph(right, BODY)])
    t = Table(data, colWidths=[3.4 * inch, 3.4 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("BOX", (0, 0), (-1, -1), 0.6, SLATE),
        ("LINEBELOW", (0, 0), (-1, 0), 0.6, SLATE),
        ("LINEBELOW", (0, 1), (-1, -2), 0.4, colors.HexColor("#e2e8f0")),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    return t


_FIELD_SEQ = [0]


def _next_field_name(prefix: str) -> str:
    _FIELD_SEQ[0] += 1
    return f"{prefix}_{_FIELD_SEQ[0]}"


class FillLine(Flowable):
    """Labeled blank line with an overlay AcroForm text field.

    Click + type in any PDF reader (Preview, Acrobat, Edge, Chrome).
    Printed copies show a hairline rule, so it works on paper too.
    """

    def __init__(self, label: str, label_width: float = 1.6 * inch,
                 height: float = 22) -> None:
        super().__init__()
        self.label = label
        self.label_width = label_width
        self.height = height
        self.width = 0.0
        self.field_name = _next_field_name("text")

    def wrap(self, avail_width: float, avail_height: float):
        self.width = avail_width
        return avail_width, self.height

    def draw(self) -> None:
        c = self.canv
        c.setFont("Helvetica-Bold", 10)
        c.setFillColor(INK)
        c.drawString(0, 7, self.label)
        line_start = self.label_width
        line_end = self.width
        c.setStrokeColor(colors.HexColor("#94a3b8"))
        c.setLineWidth(0.6)
        c.line(line_start, 4, line_end, 4)
        try:
            abs_x, abs_y = c.absolutePosition(line_start, 0)
            c.acroForm.textfield(
                name=self.field_name,
                tooltip=self.label,
                x=abs_x,
                y=abs_y,
                width=line_end - line_start,
                height=self.height - 4,
                fontSize=11,
                fillColor=colors.transparent,
                borderColor=colors.transparent,
                textColor=INK,
                forceBorder=False,
            )
        except Exception:
            pass


def signature_block():
    """Stacked fillable fields: signature, date, printed name, title.

    Each line is a real AcroForm text field — Paul or Philip can click
    and type directly in their PDF reader. Hairline rule below each
    label keeps printed copies usable too.
    """
    return [
        FillLine("Client signature:", label_width=2.0 * inch),
        Spacer(1, 10),
        FillLine("Date:", label_width=2.0 * inch),
        Spacer(1, 10),
        FillLine("Printed name:", label_width=2.0 * inch),
        Spacer(1, 10),
        FillLine("Title:", label_width=2.0 * inch),
    ]


def build():
    doc = BaseDocTemplate(
        str(OUT_FILE),
        pagesize=letter,
        leftMargin=0.7 * inch,
        rightMargin=0.7 * inch,
        topMargin=0.7 * inch,
        bottomMargin=0.7 * inch,
        title="BlueJays Service-Level Agreement",
        author="BlueJays Business Solutions LLC",
    )
    frame = Frame(
        doc.leftMargin, doc.bottomMargin,
        doc.width, doc.height,
        id="main", showBoundary=0,
    )
    doc.addPageTemplates([PageTemplate(id="default", frames=[frame])])

    story = []

    # ── Header ────────────────────────────────────────────────────
    story.append(Paragraph("Service-Level Agreement", TITLE))
    story.append(Paragraph(
        f"BlueJays Business Solutions LLC · effective {date.today().strftime('%B %d, %Y')}",
        SUBTITLE,
    ))
    story.append(HRFlowable(width="100%", thickness=1, color=SKY))
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "This SLA is the working contract between BlueJays and every AI System "
        "(<b>$10,000 one-time</b>) client. It defines how fast we respond, "
        "when we're available, and what's in or out of scope. Read once, "
        "acknowledge, and keep it handy — these are the numbers we hold ourselves to.",
        BODY,
    ))

    # ── Response commitments ──────────────────────────────────────
    story.append(Paragraph("Response commitments", H2))
    story.append(Paragraph(
        "Every request is triaged into one of four lanes. The slowest lane "
        "still beats most agencies' fastest.",
        BODY,
    ))
    story.append(Spacer(1, 4))
    story.append(commitment_table([
        (
            "<b>Standard email</b><br/>Questions, requests, ideas, "
            "small copy/funnel tweaks",
            "<b>4 business hours</b><br/>Mon&ndash;Fri 8a&ndash;6p PT &middot; "
            "if you write Saturday morning you'll usually hear back same day",
        ),
        (
            "<b>SMS lifeline (priority)</b><br/>2 lifelines included per "
            "calendar month &middot; for the moments that can't wait for email",
            "<b>1 hour</b> during business hours<br/>"
            "<b>4 hours</b> after-hours or weekend &middot; "
            "additional lifelines $50 each",
        ),
        (
            "<b>Ad-account fire-drill</b><br/>Meta/Google account suspension, "
            "billing failure, broken pixel, ad creative pulled",
            "<b>24 hours</b><br/>Triaged immediately on detection, fix or "
            "workaround within 24 hours of you flagging it",
        ),
        (
            "<b>Funnel / copy revision</b><br/>Standard cadence work &mdash; "
            "rewrite a step, add an audience, swap an offer",
            "<b>2 business days</b><br/>Faster on weeks where no fires are "
            "burning; this is the worst-case guarantee",
        ),
    ]))

    # ── Availability ──────────────────────────────────────────────
    story.append(Paragraph("Availability", H2))
    story.append(Paragraph(
        "<b>Business hours:</b> Monday&ndash;Friday, 8:00am&ndash;6:00pm Pacific Time. "
        "After-hours and weekend windows are covered for SMS-lifeline and "
        "fire-drill lanes only; standard email queues until the next "
        "business morning.",
        BODY,
    ))
    story.append(Paragraph(
        "<b>Holidays observed (no standard-lane response):</b> US federal "
        "holidays plus December 24&ndash;26 and December 31&ndash;January 1. "
        "Fire-drill lane stays active year-round.",
        BODY,
    ))
    story.append(Paragraph(
        "<b>Maintenance window:</b> first Sunday of each month, 2:00am&ndash;4:00am PT. "
        "Portal may be intermittently unavailable. Critical pushes outside "
        "this window are announced 24 hours ahead via email + portal banner.",
        BODY,
    ))
    story.append(Paragraph(
        "<b>Uptime target:</b> 99.5% for the owner portal and lead-capture "
        "endpoints. Live status: <font color='#0ea5e9'>"
        "bluejayportfolio.com/status</font>.",
        BODY,
    ))

    # ── What's included ───────────────────────────────────────────
    story.append(Paragraph("What's included every month", H2))
    story.append(Paragraph(
        "Beyond the response commitments above, every AI System client also gets:",
        BODY,
    ))
    bullets = [
        "<b>Weekly 20-minute strategy call</b> during the 30-day install rollout. "
        "After install we communicate as needed — no forced cadence.",
        "<b>2 SMS lifelines</b> per month (define above).",
        "<b>Weekly progress email</b> every Friday (8a PT) showing what shipped, "
        "what's in flight, and the leads/funnel numbers for the week.",
        "<b>Monthly funnel review</b>: one of your active audience funnels gets "
        "a full audit + revision proposal sent your way.",
        "<b>Unlimited small copy edits</b>: hero tagline, button text, FAQ updates, "
        "headline tweaks &mdash; routed through the standard-email lane.",
        "<b>Bug + outage response</b>: any portal bug or feature regression we "
        "ship gets fixed without counting against your lifeline allotment.",
    ]
    for b in bullets:
        story.append(Paragraph(f"&bull;&nbsp; {b}", BODY))

    # ── Out of scope ──────────────────────────────────────────────
    story.append(Paragraph("Out of scope (or billed separately)", H2))
    story.append(Paragraph(
        "We won't ghost on these &mdash; we'll just give you a clean quote first.",
        BODY,
    ))
    out_bullets = [
        "<b>New product builds</b> not in your original AI System scope "
        "(custom integrations, new tenant-facing features, large new sections). "
        "Quoted as add-ons.",
        "<b>Third-party platform outages</b> (Meta, Google, Twilio, Stripe, "
        "Supabase, Vercel). We escalate on your behalf and report ETA; we "
        "can't promise fix times for systems we don't control.",
        "<b>Ad spend + AI infrastructure (Claude, etc.)</b> &mdash; you pay "
        "the vendors directly. We set up + manage the accounts during install; "
        "ongoing usage charges aren't part of the $10,000 program fee.",
        "<b>Optional managed-operations retainer ($500/mo)</b> &mdash; if you "
        "want BlueJays to keep actively overseeing your funnel, ads, and "
        "AI Operator after the 30-day install window (rather than the "
        "as-needed updates model). Not promoted publicly &mdash; available "
        "on request only.",
        "<b>Data exports / migrations</b> to your own systems beyond the "
        "standard API (read-only at <font color='#0ea5e9'>"
        "bluejayportfolio.com/api/v1/clients/[slug]/leads</font>) are billed "
        "at our hourly rate.",
    ]
    for b in out_bullets:
        story.append(Paragraph(f"&bull;&nbsp; {b}", BODY))

    # ── What continues after the 4-installment program ───────────
    story.append(Paragraph(
        "What continues after the 4-installment program",
        H2,
    ))
    story.append(Paragraph(
        "The $10,000 covers a one-time AI Marketing System buildout paid in "
        "4 quarterly installments. Once the 4th installment lands, here's "
        "what stays on and what changes:",
        BODY,
    ))
    after_bullets = [
        "<b>The system is yours.</b> Site, portal, funnel definitions, ad "
        "library, brand-voice configuration, and lead data all stay live "
        "under your account and your domain.",
        "<b>AI replies continue.</b> Lead Reply Drafter, Audience Detector, "
        "and Drill of Week broadcasts keep running because you pay the "
        "underlying AI vendor (Claude / OpenAI) directly on your card. "
        "BlueJays doesn't gate that.",
        "<b>BlueJays steps back to as-needed.</b> No more scheduled cadence. "
        "I'm available for updates, fixes, and questions on the same SLA "
        "response times — you reach out when you need me.",
        "<b>Optional ongoing oversight ($500/mo).</b> If you want me actively "
        "managing weekly ad iteration, funnel optimization, and weekly "
        "strategy calls beyond the 30-day install window, we add the "
        "$500/mo managed-operations retainer. Available on request only "
        "&mdash; not promoted publicly.",
    ]
    for b in after_bullets:
        story.append(Paragraph(f"&bull;&nbsp; {b}", BODY))

    # ── Data ownership ───────────────────────────────────────────
    story.append(Paragraph("Data ownership", H2))
    story.append(Paragraph(
        "Everything generated under your slug is yours, period.",
        BODY,
    ))
    data_bullets = [
        "<b>Lead lists, customer data, ad performance metrics, brand "
        "voice configs, funnel content, voicemail recordings, weekly "
        "reports</b> &mdash; owned by you. BlueJays is the operator, not "
        "the owner.",
        "<b>Export anytime.</b> Standard CSV export from the portal "
        "Leads tab is one click. Full-database exports (everything "
        "across every table tied to your slug) are available on request "
        "&mdash; 1 business day turnaround, no fee while you're an "
        "active client, $250 one-time fee for ex-clients.",
        "<b>If you cancel or non-renew the optional $500/mo retainer</b>, "
        "your data stays exactly where it is. You keep portal access, "
        "lead data, and the site. BlueJays just stops actively managing "
        "iteration work.",
        "<b>Source code + custom assets</b> built specifically for TEKKY "
        "(your bespoke site code, your funnel JSON, your ad creative "
        "files) are yours on request. The underlying BlueJays platform "
        "(shared portal infrastructure, generic templates) stays our IP.",
    ]
    for b in data_bullets:
        story.append(Paragraph(f"&bull;&nbsp; {b}", BODY))

    # ── Escalation path ───────────────────────────────────────────
    story.append(Paragraph("Escalation path", H2))
    story.append(Paragraph(
        "When something feels off, here's the right channel in priority order:",
        BODY,
    ))
    story.append(commitment_table([
        ("<b>1. Standard email</b>",
         "bluejaycontactme@gmail.com &mdash; covers 95%+ of requests"),
        ("<b>2. Portal &lsquo;+ Note&rsquo; pill</b>",
         "Drop a note on any funnel card &mdash; routes to Ben's inbox + SMS"),
        ("<b>3. SMS lifeline</b>",
         "Text the number on your welcome card &mdash; uses one of your "
         "2/month allotment"),
        ("<b>4. Direct phone</b>",
         "Reserved for true emergencies (active outage, locked out, "
         "billing crisis). Phone number on welcome card."),
    ]))

    # ── Page break ───────────────────────────────────────────────
    story.append(PageBreak())

    # ── Acknowledgment ───────────────────────────────────────────
    story.append(Paragraph("Acknowledgment", H2))
    story.append(Paragraph(
        "By signing below (or clicking submit on the digital sign page at "
        "<font color='#0ea5e9'>bluejayportfolio.com/sign/[your-slug]/sla</font>) "
        "you confirm you've read this SLA and understand the commitments, "
        "exclusions, and escalation order described above.",
        BODY,
    ))
    story.append(Paragraph(
        "This SLA may be revised with 30 days written notice. The current "
        "version is always available at "
        "<font color='#0ea5e9'>bluejayportfolio.com/onboarding/bluejays-sla.pdf</font>.",
        BODY,
    ))
    story.append(Spacer(1, 24))
    for el in signature_block():
        story.append(el)

    story.append(Spacer(1, 24))
    story.append(HRFlowable(width="100%", thickness=0.6, color=SLATE))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "BlueJays Business Solutions LLC &middot; bluejaycontactme@gmail.com &middot; "
        "bluejayportfolio.com",
        SMALL,
    ))
    story.append(Paragraph(
        f"Document version: {date.today().isoformat()} &middot; locked rules per "
        "CLAUDE.md &lsquo;Service-Level Commitment&rsquo;",
        SMALL,
    ))

    doc.build(story)
    print(f"Wrote {OUT_FILE}")


if __name__ == "__main__":
    build()
