"""
Generate 4 client-onboarding PDFs for Tekky / Zenith Sports.

Outputs to bluejays/public/clients/zenith-sports/pdfs/ so the files are
web-accessible at https://bluejayportfolio.com/clients/zenith-sports/pdfs/
(and from the local dev server at http://localhost:PORT/clients/
zenith-sports/pdfs/<filename>.pdf):

  1. tekky-onboarding-handoff.pdf  — Paul-facing welcome packet with
     fillable sections (new password, voicemail dates, sign-off).
  2. tekky-walkthrough-prep.pdf    — Ben-facing prep sheet with
     checkboxes + question fields.
  3. tekky-brand-voice.pdf         — Reference doc, no fields.
  4. tekky-sunday-cutover.pdf      — Ben-facing runbook with
     timestamp blanks + checkboxes per step.

Both Ben and Paul can write into the fillable sections via any PDF
editor (Preview, Adobe, Edge), OR print + handwrite on the blank
lines and checkboxes.

Re-run from repo root:
    python scripts/generate-zenith-onboarding-pdfs.py
"""

from __future__ import annotations

import os
from pathlib import Path
from datetime import date

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate,
    Flowable,
    Frame,
    HRFlowable,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from svglib.svglib import svg2rlg


# ── Brand tokens (match Zenith showcase page) ────────────────────────
NAVY = colors.HexColor("#0a0f1e")
NAVY_LIGHT = colors.HexColor("#1a2438")
INK = colors.HexColor("#0f172a")
SLATE = colors.HexColor("#475569")
LIGHT = colors.HexColor("#f8fafc")
LIME = colors.HexColor("#84cc16")
AMBER = colors.HexColor("#f59e0b")
ROSE = colors.HexColor("#e11d48")
WHITE = colors.white


# ── Paths ────────────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent
# Output to public/ so PDFs are web-accessible at
# /clients/zenith-sports/pdfs/<file>.pdf
OUT = ROOT / "public" / "clients" / "zenith-sports" / "pdfs"
OUT.mkdir(parents=True, exist_ok=True)

# Logo asset (vector SVG sourced from src/components/BluejayLogo.tsx,
# saved as a standalone file for ReportLab embedding via svglib).
LOGO_SVG = Path(__file__).resolve().parent / "assets" / "bluejay-logo.svg"


def make_logo_drawing(target_height: float = 32, fill: colors.Color = None):
    """Load the Bluejay SVG and scale it to a target height (points).

    Returns a Drawing flowable that can be appended to a Platypus story.
    Pass fill=WHITE for dark backgrounds, NAVY/LIME for light.
    """
    drawing = svg2rlg(str(LOGO_SVG))
    if drawing is None:
        return None
    # Source viewBox is 100×100 → scale by target_height/100.
    scale = target_height / 100.0
    drawing.width = 100 * scale
    drawing.height = 100 * scale
    drawing.scale(scale, scale)
    return drawing


# ── Styles ───────────────────────────────────────────────────────────
def make_styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    s: dict[str, ParagraphStyle] = {}

    s["cover_eyebrow"] = ParagraphStyle(
        "cover_eyebrow",
        parent=base["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        textColor=LIME,
        spaceAfter=10,
        alignment=TA_LEFT,
    )
    s["cover_title"] = ParagraphStyle(
        "cover_title",
        parent=base["Title"],
        fontName="Helvetica-Bold",
        fontSize=36,
        leading=42,
        textColor=NAVY,
        spaceAfter=12,
        alignment=TA_LEFT,
    )
    s["cover_subtitle"] = ParagraphStyle(
        "cover_subtitle",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=14,
        leading=20,
        textColor=SLATE,
        spaceAfter=8,
        alignment=TA_LEFT,
    )
    s["cover_meta"] = ParagraphStyle(
        "cover_meta",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=10,
        textColor=SLATE,
        alignment=TA_LEFT,
    )
    s["h1"] = ParagraphStyle(
        "h1",
        parent=base["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=26,
        textColor=NAVY,
        spaceBefore=14,
        spaceAfter=10,
    )
    s["h2"] = ParagraphStyle(
        "h2",
        parent=base["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        textColor=NAVY,
        spaceBefore=14,
        spaceAfter=6,
    )
    s["h3"] = ParagraphStyle(
        "h3",
        parent=base["Heading3"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=14,
        textColor=NAVY_LIGHT,
        spaceBefore=10,
        spaceAfter=4,
    )
    s["eyebrow"] = ParagraphStyle(
        "eyebrow",
        parent=base["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        textColor=LIME,
        spaceBefore=8,
        spaceAfter=2,
    )
    s["body"] = ParagraphStyle(
        "body",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=10.5,
        leading=15,
        textColor=INK,
        spaceAfter=6,
    )
    s["body_muted"] = ParagraphStyle(
        "body_muted",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=14,
        textColor=SLATE,
        spaceAfter=4,
    )
    s["body_small"] = ParagraphStyle(
        "body_small",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=SLATE,
    )
    s["bullet"] = ParagraphStyle(
        "bullet",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=10.5,
        leading=15,
        textColor=INK,
        leftIndent=18,
        bulletIndent=4,
        spaceAfter=3,
    )
    s["quote_amber"] = ParagraphStyle(
        "quote_amber",
        parent=base["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=10.5,
        leading=16,
        textColor=NAVY,
        leftIndent=14,
        rightIndent=14,
        spaceBefore=4,
        spaceAfter=8,
        backColor=colors.HexColor("#fef3c7"),
        borderColor=AMBER,
        borderWidth=0,
        borderPadding=10,
    )
    s["mono_box"] = ParagraphStyle(
        "mono_box",
        parent=base["Code"],
        fontName="Courier",
        fontSize=9.5,
        leading=13,
        textColor=INK,
        leftIndent=8,
        rightIndent=8,
        spaceBefore=4,
        spaceAfter=8,
        backColor=colors.HexColor("#f1f5f9"),
        borderColor=colors.HexColor("#cbd5e1"),
        borderWidth=0.5,
        borderPadding=8,
    )
    s["warn"] = ParagraphStyle(
        "warn",
        parent=base["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=14,
        textColor=ROSE,
        leftIndent=12,
        spaceBefore=6,
        spaceAfter=6,
    )
    return s


# ── Custom flowables ─────────────────────────────────────────────────
# Counter for generating unique AcroForm field names. PDF AcroForm
# requires every field name to be unique within the document.
_FIELD_SEQ = [0]


def _next_field_name(prefix: str) -> str:
    _FIELD_SEQ[0] += 1
    return f"{prefix}_{_FIELD_SEQ[0]}"


class FillLine(Flowable):
    """A labeled horizontal blank line + an overlay AcroForm text field.

    Visually: label flush-left in bold, hairline rule on the right.
    Functionally: a real fillable PDF text field overlaid on the line,
    so the user can click and type in Preview/Acrobat/Edge AND printed
    copies look correct.
    """

    def __init__(
        self,
        label: str,
        width: float | None = None,
        height: float = 22,
        label_width: float = 1.6 * inch,
        sublabel: str = "",
        field_name: str | None = None,
    ) -> None:
        super().__init__()
        self.label = label
        self.sublabel = sublabel
        self.width = width
        self.height = height
        self.label_width = label_width
        self.field_name = field_name or _next_field_name("text")

    def wrap(self, avail_width: float, avail_height: float) -> tuple[float, float]:
        self.width = avail_width
        return avail_width, self.height

    def draw(self) -> None:  # type: ignore[override]
        c = self.canv
        # Label
        c.setFont("Helvetica-Bold", 10)
        c.setFillColor(NAVY)
        c.drawString(0, 7, self.label)
        if self.sublabel:
            c.setFont("Helvetica", 8)
            c.setFillColor(SLATE)
            c.drawString(0, -4, self.sublabel)
        # Hairline rule (for printed copies and visual reference)
        line_start = self.label_width
        line_end = self.width
        c.setStrokeColor(colors.HexColor("#94a3b8"))
        c.setLineWidth(0.6)
        c.line(line_start, 4, line_end, 4)
        # Overlay AcroForm text field (clickable in any PDF reader).
        # acroForm.textfield() uses ABSOLUTE page coordinates, so we have
        # to convert the flowable-local (x, y) to page coords via the
        # canvas's current transform.
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
            # Older ReportLab versions or weird canvas state — fall back
            # to just the visible line. Field still works on print.
            pass


class Checkbox(Flowable):
    """A visible square + label that is ALSO a real AcroForm checkbox.

    Click in any PDF reader to toggle; prints as a plain square so it
    works on paper too.
    """

    def __init__(
        self,
        label: str,
        size: float = 10,
        font_size: float = 10,
        bold: bool = False,
        field_name: str | None = None,
    ) -> None:
        super().__init__()
        self.label = label
        self.size = size
        self.font_size = font_size
        self.bold = bold
        self.field_name = field_name or _next_field_name("check")

    def wrap(self, avail_width: float, avail_height: float) -> tuple[float, float]:
        self.width = avail_width
        return avail_width, max(self.size, self.font_size) + 6

    def draw(self) -> None:  # type: ignore[override]
        c = self.canv
        # Real AcroForm checkbox (renders its own visible box). Uses
        # absolute page coordinates — translate via current canvas
        # transform.
        placed_box = False
        try:
            abs_x, abs_y = c.absolutePosition(0, 1)
            c.acroForm.checkbox(
                name=self.field_name,
                tooltip=self.label,
                x=abs_x,
                y=abs_y,
                size=self.size,
                checked=False,
                buttonStyle="check",
                borderColor=NAVY,
                fillColor=WHITE,
                textColor=NAVY,
                forceBorder=True,
            )
            placed_box = True
        except Exception:
            pass
        # Fallback or supplement: draw a visible square so printed copies
        # still show the checkbox. ReportLab's acroForm checkbox does NOT
        # render a permanent box in the PDF — only the click target. So
        # we always draw the visible square underneath.
        if not placed_box:
            c.setStrokeColor(NAVY)
            c.setLineWidth(0.8)
            c.rect(0, 1, self.size, self.size, stroke=1, fill=0)
        # Label to the right of the box.
        c.setFont(
            "Helvetica-Bold" if self.bold else "Helvetica",
            self.font_size,
        )
        c.setFillColor(INK)
        c.drawString(self.size + 6, 3, self.label)


class Divider(Flowable):
    """Thin horizontal rule used between sections."""

    def __init__(self, color: colors.Color = NAVY, thickness: float = 0.4) -> None:
        super().__init__()
        self.color = color
        self.thickness = thickness

    def wrap(self, avail_width: float, avail_height: float) -> tuple[float, float]:
        self.width = avail_width
        return avail_width, 6

    def draw(self) -> None:  # type: ignore[override]
        c = self.canv
        c.setStrokeColor(self.color)
        c.setLineWidth(self.thickness)
        c.line(0, 3, self.width, 3)


class AccentBar(Flowable):
    """A 4px-tall lime accent bar used for section openers."""

    def __init__(self, color: colors.Color = LIME, width_frac: float = 0.18) -> None:
        super().__init__()
        self.color = color
        self.width_frac = width_frac

    def wrap(self, avail_width: float, avail_height: float) -> tuple[float, float]:
        self.width = avail_width
        return avail_width, 8

    def draw(self) -> None:  # type: ignore[override]
        c = self.canv
        bar_w = self.width * self.width_frac
        c.setFillColor(self.color)
        c.rect(0, 2, bar_w, 4, stroke=0, fill=1)


class WriteBox(Flowable):
    """A bordered multi-line box that's ALSO a real AcroForm textarea.

    Click and type to fill digitally; prints with light guide lines
    for handwriting.
    """

    def __init__(
        self,
        label: str,
        lines: int = 4,
        line_height: float = 18,
        field_name: str | None = None,
    ) -> None:
        super().__init__()
        self.label = label
        self.lines = lines
        self.line_height = line_height
        self.field_name = field_name or _next_field_name("textarea")

    def wrap(self, avail_width: float, avail_height: float) -> tuple[float, float]:
        self.width = avail_width
        height = 16 + self.lines * self.line_height + 6
        self.height = height
        return avail_width, height

    def draw(self) -> None:  # type: ignore[override]
        c = self.canv
        # Label above box
        if self.label:
            c.setFont("Helvetica-Bold", 10)
            c.setFillColor(NAVY)
            c.drawString(0, self.height - 12, self.label)
        # Box border + guide lines (for printed copies)
        box_top = self.height - 18 if self.label else self.height - 4
        box_bottom = 4
        c.setStrokeColor(colors.HexColor("#cbd5e1"))
        c.setLineWidth(0.6)
        c.rect(
            0,
            box_bottom,
            self.width,
            box_top - box_bottom,
            stroke=1,
            fill=0,
        )
        c.setStrokeColor(colors.HexColor("#e2e8f0"))
        c.setLineWidth(0.4)
        for i in range(1, self.lines):
            y = box_bottom + i * self.line_height
            c.line(6, y, self.width - 6, y)
        # Overlay AcroForm multi-line text field. Uses absolute page
        # coordinates — translate via current canvas transform.
        try:
            abs_x, abs_y = c.absolutePosition(2, box_bottom + 2)
            c.acroForm.textfield(
                name=self.field_name,
                tooltip=self.label or "Notes",
                x=abs_x,
                y=abs_y,
                width=self.width - 4,
                height=(box_top - box_bottom) - 4,
                fontSize=10,
                fieldFlags="multiline",
                fillColor=colors.transparent,
                borderColor=colors.transparent,
                textColor=INK,
                forceBorder=False,
            )
        except Exception:
            pass


# ── Page decorations ─────────────────────────────────────────────────
def on_page_branded(doc_title: str, footer_note: str):
    def _draw(canvas, doc) -> None:  # noqa: ANN001
        w, h = letter
        # Top brand bar (3px lime)
        canvas.setFillColor(LIME)
        canvas.rect(0, h - 3, w, 3, stroke=0, fill=1)
        # Header: brand left + doc title right
        canvas.setFont("Helvetica-Bold", 9)
        canvas.setFillColor(NAVY)
        canvas.drawString(0.6 * inch, h - 22, "TEKKY · ZENITH SPORTS")
        canvas.setFont("Helvetica", 9)
        canvas.setFillColor(SLATE)
        canvas.drawRightString(w - 0.6 * inch, h - 22, doc_title)
        # Footer: tiny logo + brand text + page #
        try:
            from reportlab.graphics import renderPDF as _renderPDF
            logo = make_logo_drawing(target_height=14)
            if logo is not None:
                _renderPDF.draw(logo, canvas, 0.6 * inch - 2, 0.32 * inch)
                canvas.setFont("Helvetica-Bold", 8)
                canvas.setFillColor(NAVY)
                canvas.drawString(
                    0.6 * inch + 18,
                    0.4 * inch,
                    "BlueJays",
                )
                canvas.setFont("Helvetica", 8)
                canvas.setFillColor(SLATE)
                canvas.drawString(
                    0.6 * inch + 18 + 42,
                    0.4 * inch,
                    f"·  {footer_note}",
                )
            else:
                canvas.setFont("Helvetica", 8)
                canvas.setFillColor(SLATE)
                canvas.drawString(0.6 * inch, 0.4 * inch, footer_note)
        except Exception:
            canvas.setFont("Helvetica", 8)
            canvas.setFillColor(SLATE)
            canvas.drawString(0.6 * inch, 0.4 * inch, footer_note)
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(SLATE)
        canvas.drawRightString(
            w - 0.6 * inch,
            0.4 * inch,
            f"Page {doc.page}",
        )

    return _draw


def make_doc(path: Path, title: str, footer_note: str) -> BaseDocTemplate:
    doc = BaseDocTemplate(
        str(path),
        pagesize=letter,
        leftMargin=0.7 * inch,
        rightMargin=0.7 * inch,
        topMargin=0.7 * inch,
        bottomMargin=0.7 * inch,
        title=title,
        author="BlueJays · Ben Freeman",
    )
    frame = Frame(
        doc.leftMargin,
        doc.bottomMargin,
        doc.width,
        doc.height,
        id="content",
    )
    doc.addPageTemplates(
        [
            PageTemplate(
                id="branded",
                frames=[frame],
                onPage=on_page_branded(title, footer_note),
            )
        ]
    )
    return doc


# ────────────────────────────────────────────────────────────────────
#  PDF 1 — onboarding-handoff.pdf  (Paul-facing welcome packet)
# ────────────────────────────────────────────────────────────────────
def build_onboarding_handoff(s: dict[str, ParagraphStyle]) -> None:
    out = OUT / "tekky-onboarding-handoff.pdf"
    doc = make_doc(
        out,
        "Owner Onboarding · Tekky",
        "bluejayportfolio.com · bluejaycontactme@gmail.com",
    )
    flow: list = []

    # ── Cover ──
    flow.append(Spacer(1, 0.9 * inch))
    # BlueJays logo
    logo = make_logo_drawing(target_height=48)
    if logo is not None:
        flow.append(logo)
    flow.append(Spacer(1, 16))
    flow.append(AccentBar())
    flow.append(Spacer(1, 14))
    flow.append(Paragraph("OWNER ONBOARDING PACKET", s["cover_eyebrow"]))
    flow.append(Paragraph("Welcome to your<br/>AI Marketing System.", s["cover_title"]))
    flow.append(Spacer(1, 8))
    flow.append(
        Paragraph(
            "Everything Paul needs to operate the Tekky portal from day "
            "one — credentials, tab tour, what's automated, what's on you, "
            "pricing breakdown, account-creation permissions, and our "
            "card-on-file policy.",
            s["cover_subtitle"],
        )
    )
    flow.append(Spacer(1, 22))
    flow.append(
        Paragraph(
            "Prepared for: <b>Paul Hanson</b>",
            s["cover_meta"],
        )
    )
    flow.append(
        Paragraph(
            f"Delivered: <b>{date.today().isoformat()}</b> &nbsp;·&nbsp; "
            "Live walkthrough: <b>Sunday 2026-05-17, 9:00 AM PT</b>",
            s["cover_meta"],
        )
    )
    flow.append(Spacer(1, 22))
    flow.append(
        Paragraph(
            "Print this. Bookmark it. Bring it to every check-in.",
            s["body_muted"],
        )
    )
    flow.append(Spacer(1, 10))
    flow.append(
        Paragraph(
            "<b>Confirm receipt online (click + type to fill, or print + "
            "handwrite):</b><br/>"
            "<font face='Courier' size='10'>"
            "bluejayportfolio.com/sign/zenith-sports/handoff"
            "</font>",
            s["body_muted"],
        )
    )
    flow.append(PageBreak())

    # ── Section: Your portal ──
    flow.append(AccentBar())
    flow.append(Spacer(1, 6))
    flow.append(Paragraph("01 · YOUR PORTAL", s["eyebrow"]))
    flow.append(Paragraph("Bookmark this URL.", s["h1"]))
    flow.append(
        Paragraph(
            "<b>Portal URL:</b> https://bluejayportfolio.com/clients/zenith-sports/portal",
            s["body"],
        )
    )
    flow.append(Spacer(1, 14))

    flow.append(Paragraph("Your login credential", s["h2"]))
    cred_data = [
        [
            Paragraph("<b>Paul Hanson</b>", s["body"]),
            Paragraph(
                "Email: paul@zenithsports.org<br/>"
                "Temp password: <font face='Courier'>tekky-walkthrough-paul-2026</font>",
                s["body_muted"],
            ),
        ],
    ]
    cred_table = Table(
        cred_data,
        colWidths=[1.8 * inch, doc.width - 1.8 * inch],
    )
    cred_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), LIGHT),
                ("LINEABOVE", (0, 0), (-1, 0), 0.4, colors.HexColor("#cbd5e1")),
                ("LINEBELOW", (0, -1), (-1, -1), 0.4, colors.HexColor("#cbd5e1")),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        )
    )
    flow.append(cred_table)
    flow.append(Spacer(1, 12))

    flow.append(
        Paragraph(
            "⚠ <b>Change your password as soon as you log in.</b> Click "
            "the avatar in the upper-right of the portal → \"Change "
            "password.\" The temp password above stops working once you "
            "set a permanent one.",
            s["quote_amber"],
        )
    )

    flow.append(Spacer(1, 10))
    flow.append(Paragraph("Set your new password (click to type, or print + handwrite)", s["h3"]))
    flow.append(FillLine("Paul — new password:", label_width=2.1 * inch))
    flow.append(Spacer(1, 10))
    flow.append(
        Paragraph(
            "Never share the new password over Slack or email. "
            "Pass it verbally or via a password manager.",
            s["body_small"],
        )
    )

    flow.append(PageBreak())

    # ── Section: Tab tour ──
    flow.append(AccentBar())
    flow.append(Spacer(1, 6))
    flow.append(Paragraph("02 · TAB TOUR", s["eyebrow"]))
    flow.append(Paragraph("Where you'll spend your time.", s["h1"]))
    flow.append(
        Paragraph(
            "The portal is the cockpit. ~80% of your time lives on the "
            "Leads tab. The rest is occasional check-ins.",
            s["body"],
        )
    )
    flow.append(Spacer(1, 12))

    tab_data = [
        [
            Paragraph("<b>🎯 Leads</b>", s["body"]),
            Paragraph(
                "Every parent / coach / player / club inquiry that lands in "
                "your funnel. Color-coded by audience: 🟡 Amber=Parent · "
                "🔵 Cobalt=Coach · 🟢 Lime=Player · 🟣 Violet=Club.",
                s["body_muted"],
            ),
        ],
        [
            Paragraph("<b>📋 To-Do</b>", s["body"]),
            Paragraph(
                "Task list. Each task has an owner (you or Ben) so it's "
                "clear who's holding the ball.",
                s["body_muted"],
            ),
        ],
        [
            Paragraph("<b>📣 Ads</b>", s["body"]),
            Paragraph(
                "Read-only view of your ad creative library. 43 creatives "
                "across Meta, Google, and Lob postcards. Stats hydrate "
                "once campaigns go live.",
                s["body_muted"],
            ),
        ],
        [
            Paragraph("<b>📊 Reports</b>", s["body"]),
            Paragraph(
                "Weekly auto-generated report. Fires every Monday 14:00 "
                "UTC. Pipeline value, leads by audience, top-performing "
                "ads, week-over-week deltas.",
                s["body_muted"],
            ),
        ],
        [
            Paragraph("<b>🤝 Partners</b>", s["body"]),
            Paragraph(
                "Affiliate partner roster + referral activity + "
                "commissions accrued.",
                s["body_muted"],
            ),
        ],
        [
            Paragraph("<b>🤖 AI Operator</b>", s["body"]),
            Paragraph(
                "Five AI skills that come online over the next 30 days: "
                "Reply Drafter (wk 1) · Audience Detector (wk 1) · Drill "
                "of Week (LIVE) · Customer Save Agent (wk 3) · Lead "
                "Scorer (wk 4).",
                s["body_muted"],
            ),
        ],
    ]
    tab_table = Table(
        tab_data,
        colWidths=[1.4 * inch, doc.width - 1.4 * inch],
    )
    tab_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), WHITE),
                ("ROWBACKGROUNDS", (0, 0), (-1, -1), [WHITE, LIGHT]),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 9),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LINEABOVE", (0, 0), (-1, 0), 0.4, NAVY),
                ("LINEBELOW", (0, -1), (-1, -1), 0.4, NAVY),
            ]
        )
    )
    flow.append(tab_table)

    flow.append(PageBreak())

    # ── Section: What's included (value reinforcement) ──
    flow.append(AccentBar())
    flow.append(Spacer(1, 6))
    flow.append(Paragraph("03 · WHAT'S INCLUDED", s["eyebrow"]))
    flow.append(Paragraph("Everything already running for you.", s["h1"]))
    flow.append(
        Paragraph(
            "Beyond the portal you just toured, the AI System ships with "
            "the website, funnel engine, and the tracking layer that makes "
            "the whole thing get smarter over time. Quick reference list — "
            "scan it once so nothing gets forgotten.",
            s["body"],
        )
    )
    flow.append(Spacer(1, 14))

    flow.append(Paragraph("Your website", s["h3"]))
    for b in [
        "Bespoke showcase at <b>tekky.org</b> — built ground-up to TEKKY's brand, not a template.",
        "Built-in Shop page routes to your Zenith Sports Shopify checkout — no double-billing, no separate cart.",
        "Interactive Build-Your-Player tool — parents pick age + position, get a personalized training plan.",
    ]:
        flow.append(Paragraph(f"• {b}", s["bullet"]))

    flow.append(Spacer(1, 8))
    flow.append(Paragraph("Your portal cockpit", s["h3"]))
    for b in [
        "986 leads pre-loaded, color-coded by audience (🟡 parent · 🔵 coach · 🟢 player · 🟣 club).",
        "Cmd-K search + bulk-action toolbar — log a touch on 50 leads in 3 clicks.",
        "Per-audience funnel visualization with feedback that texts Ben directly.",
        "Weekly auto-report every Monday + Sales/Partners portal for your affiliate roster.",
    ]:
        flow.append(Paragraph(f"• {b}", s["bullet"]))

    flow.append(Spacer(1, 8))
    flow.append(Paragraph("Your funnel engine", s["h3"]))
    for b in [
        "6-touch parent + coach + player email sequences, fully automated by day-offset.",
        "43 ad creatives ready across Meta Feed/Reels/Stories + Google Search/PMax/YouTube + Lob direct mail.",
        "AI Lead Reply Drafter + Audience Detector — drafts personalized replies in your voice (Phase A).",
        "Drill of Week auto-broadcasts to coach list every Tuesday 9am PT (already LIVE).",
    ]:
        flow.append(Paragraph(f"• {b}", s["bullet"]))

    flow.append(Spacer(1, 8))
    flow.append(Paragraph("Tracking + analytics (the invisible improvements)", s["h3"]))
    for b in [
        "<b>Microsoft Clarity heatmaps</b> installed — see every click, scroll depth, and rage-click on every page.",
        "Meta Pixel + Google Analytics 4 firing on every conversion event.",
        "Per-audience conversion-rate tracking — you'll know which audience converts at what rate by week 2.",
        "Custom event tracking on every CTA (shop, training drills, contact form, build-your-player).",
    ]:
        flow.append(Paragraph(f"• {b}", s["bullet"]))

    flow.append(Spacer(1, 10))
    flow.append(
        Paragraph(
            "If anything on this list ever feels invisible to you, that's "
            "a feedback loop I want to hear about. Text or email — see the "
            "Communication section.",
            s["body_muted"],
        )
    )

    flow.append(PageBreak())

    # ── Section: What's automated vs not ──
    flow.append(AccentBar())
    flow.append(Spacer(1, 6))
    flow.append(Paragraph("04 · OWNERSHIP", s["eyebrow"]))
    flow.append(Paragraph("What's automated. What's on you.", s["h1"]))
    flow.append(Spacer(1, 6))

    flow.append(Paragraph("✅ ON AUTOPILOT", s["h3"]))
    for line in [
        "Weekly drill broadcast to coach list (Tuesday 9am PT)",
        "Funnel touches via email (parent 5-touch / coach 6-touch / "
        "player 3-touch sequences) — fire automatically by day offset",
        "Weekly report email to Paul + Philip (Monday 14:00 UTC)",
        "Lead inquiries via portal contact form",
        "Map-based scout dispatch (Tekky Map → click county → cron "
        "picks it up Tuesday 14:00 UTC)",
    ]:
        flow.append(Paragraph(f"• {line}", s["bullet"]))

    flow.append(Spacer(1, 8))
    flow.append(Paragraph("🚧 STILL ON YOU (until Phase B handoff)", s["h3"]))
    for line in [
        "Reviewing AI-drafted replies before sending (week 1+)",
        "Calendly bookings (we'll wire your calendar after Phase A)",
        "Recording the 3 voicemail clips (18-24 sec each, casual "
        "founder voice)",
    ]:
        flow.append(Paragraph(f"• {line}", s["bullet"]))

    flow.append(Spacer(1, 8))
    flow.append(Paragraph("🛠 STILL ON BEN", s["h3"]))
    for line in [
        "Ad creative iteration based on weekly performance data",
        "Hyperloop variant optimization once data warrants the upgrade",
        "Funnel copy tweaks (use \"+ Note\" button on any funnel step — "
        "Ben sees them within an hour)",
    ]:
        flow.append(Paragraph(f"• {line}", s["bullet"]))

    flow.append(PageBreak())

    # ── Section: Pricing reference ──
    flow.append(AccentBar())
    flow.append(Spacer(1, 6))
    flow.append(Paragraph("05 · PRICING REFERENCE", s["eyebrow"]))
    flow.append(Paragraph("What you're paying for.", s["h1"]))
    flow.append(Spacer(1, 6))

    pricing_data = [
        [
            Paragraph("<b>Service</b>", s["body"]),
            Paragraph("<b>Tier</b>", s["body"]),
            Paragraph("<b>Price</b>", s["body"]),
            Paragraph("<b>Status</b>", s["body"]),
        ],
        [
            Paragraph("AI System buildout", s["body_muted"]),
            Paragraph("$10,000", s["body_muted"]),
            Paragraph("one-time", s["body_muted"]),
            Paragraph(
                "<b>4 quarterly installments of $2,500.</b> "
                "Q1 due at launch. Each installment includes <b>~$37</b> "
                "reserved for WA state Business &amp; Occupation tax "
                "(1.5% of service revenue, $150 total across the program), "
                "remitted by BlueJays directly to the state — no extra "
                "charge to you. <b>$300 pay-in-full discount</b> available "
                "for clients who pay the full $10,000 up front — not "
                "applied on the 4-installment plan.",
                s["body_muted"],
            ),
        ],
        [
            Paragraph("Hyperloop (auto-optimization)", s["body_muted"]),
            Paragraph("Off → Starter", s["body_muted"]),
            Paragraph("$0 → $99 / mo", s["body_muted"]),
            Paragraph("Flip after 50+ leads", s["body_muted"]),
        ],
        [
            Paragraph("Claude (AI replies + drafting)", s["body_muted"]),
            Paragraph("Pro", s["body_muted"]),
            Paragraph("$149 / mo", s["body_muted"]),
            Paragraph("Live from Phase A", s["body_muted"]),
        ],
        [
            Paragraph("Twilio (SMS + missed-call)", s["body_muted"]),
            Paragraph("TBD", s["body_muted"]),
            Paragraph("~$10-30 / mo", s["body_muted"]),
            Paragraph("Starts when number provisions", s["body_muted"]),
        ],
        [
            Paragraph("SendGrid (email)", s["body_muted"]),
            Paragraph("Starter", s["body_muted"]),
            Paragraph("$0", s["body_muted"]),
            Paragraph("Included in setup", s["body_muted"]),
        ],
        [
            Paragraph("Meta · Google Ads", s["body_muted"]),
            Paragraph("TBD", s["body_muted"]),
            Paragraph("ad spend only", s["body_muted"]),
            Paragraph("Starts Phase A stand-up", s["body_muted"]),
        ],
    ]
    pricing_table = Table(
        pricing_data,
        colWidths=[
            1.85 * inch,
            1.05 * inch,
            1.0 * inch,
            doc.width - 3.9 * inch,
        ],
    )
    pricing_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT]),
                ("LINEBELOW", (0, 0), (-1, 0), 0.6, NAVY),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    # Override header row text color
    flow.append(pricing_table)
    flow.append(Spacer(1, 12))

    flow.append(Paragraph("Quarterly installment schedule", s["h3"]))
    flow.append(
        Paragraph(
            "Each installment: <b>$2,463</b> services + <b>$37</b> WA "
            "B&amp;O tax reserve = <b>$2,500</b> total. Total program: "
            "<b>$10,000</b> ($9,850 services + $150 WA B&amp;O tax reserve "
            "at 1.5%, remitted by BlueJays directly to the state). "
            "Pay-in-full discount of <b>$300</b> available for clients "
            "who pay the full program up front — not applied on the "
            "4-installment plan.",
            s["body_muted"],
        )
    )
    flow.append(Spacer(1, 4))
    flow.append(Paragraph("• Q1 — $2,500 at launch (Sunday 2026-05-17)", s["bullet"]))
    flow.append(Paragraph("• Q2 — $2,500 on 2026-08-17", s["bullet"]))
    flow.append(Paragraph("• Q3 — $2,500 on 2026-11-17", s["bullet"]))
    flow.append(Paragraph("• Q4 — $2,500 on 2027-02-17", s["bullet"]))

    flow.append(Spacer(1, 12))
    flow.append(Paragraph("When the build clock starts", s["h3"]))
    flow.append(
        Paragraph(
            "Phase A account stand-up and build work begin the business day "
            "Q1 payment clears. This is standard for engagements at this "
            "scope — it keeps the launch timeline honest on both sides and "
            "ensures your accounts aren't sitting half-provisioned while "
            "an invoice is open. Once the first installment lands, the "
            "30-day onboarding window starts the same day.",
            s["body_muted"],
        )
    )

    flow.append(Spacer(1, 14))
    flow.append(Paragraph("Phase B handoff", s["h3"]))
    flow.append(
        Paragraph(
            "Target: 30 days post-launch. Account ownership transfers from "
            "BlueJays-managed → Zenith-managed for Twilio, Google Ads, "
            "Meta Business Manager. You start paying those vendors directly. "
            "BlueJays still operates them.",
            s["body_muted"],
        )
    )

    flow.append(PageBreak())

    # ── Section: Account access (credentials Paul shares) ──
    flow.append(AccentBar())
    flow.append(Spacer(1, 6))
    flow.append(Paragraph("06 · ACCOUNT ACCESS", s["eyebrow"]))
    flow.append(Paragraph("Logins I need from you for Phase A.", s["h1"]))
    flow.append(
        Paragraph(
            "Phase A plugs into several accounts you already own (Shopify, "
            "Facebook/Meta, Google, your domain registrar) plus a few new "
            "ones I'll stand up on your behalf (Twilio, SendGrid, Calendly, "
            "etc.). Fill in the credentials you can share below — every "
            "password lands in your encrypted credentials vault the moment "
            "I receive it (AES-256). If you'd rather hand them off verbally "
            "or via a password manager, leave blank and we'll coordinate.",
            s["body"],
        )
    )

    flow.append(Spacer(1, 12))
    flow.append(Paragraph("Authorization", s["h3"]))
    flow.append(
        Checkbox(
            "I authorize BlueJays (Ben Freeman) to create accounts on TEKKY's "
            "behalf for the Phase A buildout — Twilio, SendGrid, Calendly, "
            "and any other vendor required to complete the AI System scope.",
            bold=False,
            font_size=10,
        )
    )
    flow.append(Spacer(1, 6))
    flow.append(
        Checkbox(
            "All accounts created remain owned by TEKKY. Ownership transfers "
            "to TEKKY-managed billing during Phase B handoff (target 30 days "
            "post-launch). Until then BlueJays operates them on your card / "
            "credit on file (see next section).",
            bold=False,
            font_size=10,
        )
    )

    flow.append(PageBreak())

    # ── Per-account credential blocks ──
    flow.append(AccentBar())
    flow.append(Spacer(1, 6))
    flow.append(Paragraph("ACCOUNT LOGINS", s["eyebrow"]))
    flow.append(Paragraph("Share what you have. Skip what you don't.", s["h1"]))
    flow.append(Spacer(1, 10))

    def add_account_block(title: str, notes: str = "") -> None:
        """Helper — render a per-account credentials block."""
        flow.append(Paragraph(title, s["h3"]))
        if notes:
            flow.append(Paragraph(notes, s["body_muted"]))
            flow.append(Spacer(1, 4))
        flow.append(FillLine("Username / email:", label_width=1.8 * inch))
        flow.append(Spacer(1, 6))
        flow.append(FillLine("Password:", label_width=1.8 * inch))
        flow.append(Spacer(1, 14))

    add_account_block(
        "📧 Email account",
        "The inbox you'd like me to use for new accounts (or an existing "
        "shared inbox if you have one).",
    )

    add_account_block(
        "🛍 Shopify (Zenith Sports store)",
        "Admin-level access so I can wire the Shop CTAs + verify inventory "
        "events fire to Meta Pixel + GA4.",
    )

    add_account_block(
        "📘 Facebook / Meta Business Manager",
        "Personal FB login is fine — I'll request admin access on your "
        "Business Manager from there. Used for Meta Ads + Pixel + Instagram.",
    )

    add_account_block(
        "🔵 Google account (Ads + Analytics)",
        "Used for Google Ads, Google Analytics 4, and Search Console. "
        "If you have a Google Workspace under TEKKY, share that one.",
    )

    flow.append(PageBreak())

    # ── Domain registrar with provider choice ──
    flow.append(AccentBar())
    flow.append(Spacer(1, 6))
    flow.append(Paragraph("🌐 Domain registrar (tekky.org)", s["h3"]))
    flow.append(
        Paragraph(
            "Where tekky.org is registered — pick your provider so I know "
            "where to find your DNS settings. If your registrar isn't in "
            "the list, check Other and write it in.",
            s["body_muted"],
        )
    )
    flow.append(Spacer(1, 8))

    # 10 most common registrars laid out 2 per row for a clean grid
    registrar_data = [
        [Checkbox("GoDaddy", font_size=10), Checkbox("Namecheap", font_size=10)],
        [Checkbox("Cloudflare Registrar", font_size=10), Checkbox("Squarespace / Google Domains", font_size=10)],
        [Checkbox("Hover", font_size=10), Checkbox("Network Solutions", font_size=10)],
        [Checkbox("Bluehost", font_size=10), Checkbox("Domain.com", font_size=10)],
        [Checkbox("Name.com", font_size=10), Checkbox("HostGator", font_size=10)],
    ]
    reg_table = Table(
        registrar_data,
        colWidths=[doc.width / 2, doc.width / 2],
    )
    reg_table.setStyle(
        TableStyle(
            [
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        )
    )
    flow.append(reg_table)
    flow.append(Spacer(1, 6))
    flow.append(Checkbox("Other — write it in below:", font_size=10))
    flow.append(Spacer(1, 4))
    flow.append(FillLine("Other registrar name:", label_width=2.0 * inch))
    flow.append(Spacer(1, 12))

    flow.append(FillLine("Username / email:", label_width=1.8 * inch))
    flow.append(Spacer(1, 6))
    flow.append(FillLine("Password:", label_width=1.8 * inch))
    flow.append(Spacer(1, 10))

    flow.append(
        Paragraph(
            "Prefer to handle DNS yourself? Skip the credentials and I'll "
            "send you the two nameservers to paste — should take 60 seconds "
            "in your registrar's dashboard.",
            s["body_small"],
        )
    )

    flow.append(PageBreak())

    # ── Section: Card on file policy ──
    flow.append(AccentBar())
    flow.append(Spacer(1, 6))
    flow.append(Paragraph("07 · CARD ON FILE", s["eyebrow"]))
    flow.append(Paragraph("Our spending rules. Locked in writing.", s["h1"]))
    flow.append(
        Paragraph(
            "Several Phase A accounts (Twilio, Meta Ads, Google Ads, SendGrid "
            "paid tiers, etc.) require a payment method on file to function. "
            "Rather than asking you for your card every time we hit a "
            "subscription gate, you can leave one card on file with me and "
            "I'll use it strictly under these rules:",
            s["body"],
        )
    )

    flow.append(Spacer(1, 12))
    flow.append(Paragraph("BlueJays card-on-file commitments", s["h3"]))
    for line in [
        "I will <b>always ask you before</b> charging any card or "
        "entering card details into a new piece of software.",
        "Cards are entered <b>directly into the vendor's secure form</b> "
        "(Twilio, Meta, Google, etc.) — never stored in a BlueJays system, "
        "spreadsheet, or chat thread.",
        "I will give you a <b>cost estimate first</b> for any account that "
        "charges more than $0/month, and confirm before activation.",
        "You can <b>revoke this permission at any time</b> in writing — "
        "we'll switch to per-charge approval immediately.",
        "Monthly spend on managed-account vendors gets reported in your "
        "weekly Reports tab, with a line item per vendor.",
    ]:
        flow.append(Paragraph(f"• {line}", s["bullet"]))

    flow.append(Spacer(1, 14))
    flow.append(Paragraph("Acknowledgment", s["h3"]))
    flow.append(
        Checkbox(
            "I've read and understand the card-on-file policy above. Ben "
            "will always ask me before charging a card or entering one "
            "into any new software.",
            bold=False,
            font_size=10,
        )
    )

    flow.append(PageBreak())

    # ── Section: Your action items ──
    flow.append(AccentBar())
    flow.append(Spacer(1, 6))
    flow.append(Paragraph("08 · ACTION ITEMS", s["eyebrow"]))
    flow.append(Paragraph("What's on you. Check off as you go.", s["h1"]))
    flow.append(Spacer(1, 8))

    flow.append(Paragraph("Within 24 hours of launch", s["h3"]))
    for item in [
        "Log in and change your password",
        "Bookmark the portal URL on phone + laptop",
        "Add bluejaycontactme@gmail.com to your safe-senders list",
    ]:
        flow.append(Checkbox(item))
        flow.append(Spacer(1, 4))

    flow.append(Spacer(1, 6))
    flow.append(Paragraph("Within 1 week", s["h3"]))
    for item in [
        "Record voicemail clip #1 — Welcome (18-24 sec)",
        "Record voicemail clip #2 — Missed call (18-24 sec)",
        "Record voicemail clip #3 — After hours (18-24 sec)",
        "Confirm your preferred contact email for AI Reply Drafter",
        "Connect your Google Calendar (we'll send the link)",
    ]:
        flow.append(Checkbox(item))
        flow.append(Spacer(1, 4))

    flow.append(Spacer(1, 10))
    flow.append(FillLine("Voicemail recording date scheduled:", label_width=2.6 * inch))
    flow.append(Spacer(1, 8))
    flow.append(FillLine("Calendly / Google Calendar email:", label_width=2.6 * inch))
    flow.append(Spacer(1, 8))
    flow.append(FillLine("Preferred contact email for AI replies:", label_width=2.6 * inch))

    flow.append(Spacer(1, 16))
    flow.append(Paragraph("Notes / questions for Ben", s["h3"]))
    flow.append(WriteBox("", lines=5))

    flow.append(PageBreak())

    # ── Section: Voicemail scripts ──
    flow.append(AccentBar())
    flow.append(Spacer(1, 6))
    flow.append(Paragraph("09 · VOICEMAIL SCRIPTS", s["eyebrow"]))
    flow.append(Paragraph("Three clips. Your voice. Brand-aligned.", s["h1"]))
    flow.append(
        Paragraph(
            "When you sit down to record the three voicemail clips, read "
            "these scripts as-written. They're 18-22 seconds each, "
            "calibrated to Tekky's brand voice (specific, coach-like, no "
            "hype). Use Voice Memos (iOS) or Recorder (Android), then "
            "email the three <font face='Courier'>.m4a</font> files to "
            "<b>bluejaycontactme@gmail.com</b> — Ben uploads them to your "
            "Twilio account.",
            s["body"],
        )
    )
    flow.append(Spacer(1, 14))

    flow.append(Paragraph("Recording tips", s["h3"]))
    for tip in [
        "Quiet room. Phone speaker face-down on a folded towel.",
        "Stand up. Voice comes through firmer than sitting.",
        "Smile on Clip 1 and 2 — it actually changes the tone.",
        "If you flub a line, restart the whole take. Editing splices "
        "are audible.",
    ]:
        flow.append(Paragraph(f"• {tip}", s["bullet"]))

    flow.append(Spacer(1, 14))
    flow.append(Paragraph("Clip 1 — Welcome / Main greeting", s["h3"]))
    flow.append(Paragraph("Target length: 18-22 sec", s["body_small"]))
    flow.append(
        Paragraph(
            "“Hey, this is Paul over at Zenith Sports and Tekky. "
            "Thanks for calling. Quickest way to reach me is to leave "
            "your name, what your player's working on, and your number. "
            "I'll get back to you the same day. If you want training "
            "tips or to grab a Tekky ball, head to tekky.org. Talk "
            "soon.”",
            s["quote_amber"],
        )
    )

    flow.append(Spacer(1, 10))
    flow.append(Paragraph("Clip 2 — Missed call callback", s["h3"]))
    flow.append(Paragraph("Target length: 18-22 sec", s["body_small"]))
    flow.append(
        Paragraph(
            "“Hey, Paul from Tekky here. Sorry I missed your call "
            "— I'm probably with a player on the field. Drop me your "
            "name, what your player needs help with, and the best "
            "number to reach you back, and I'll call you the same day. "
            "If you want to grab the ball or see drills, that's at "
            "tekky.org. Talk soon.”",
            s["quote_amber"],
        )
    )

    flow.append(Spacer(1, 10))
    flow.append(Paragraph("Clip 3 — After hours", s["h3"]))
    flow.append(Paragraph("Target length: 18-22 sec", s["body_small"]))
    flow.append(
        Paragraph(
            "“You've reached Paul at Tekky. We're closed for the "
            "evening — I check messages first thing in the morning. "
            "Leave your name, your player's age, and what you're "
            "working on, and I'll get back to you tomorrow. For drills "
            "or the Tekky ball, head to tekky.org anytime. Have a good "
            "one.”",
            s["quote_amber"],
        )
    )

    flow.append(Spacer(1, 12))
    flow.append(
        Paragraph(
            "You can also read these scripts in your portal — Docs tab, "
            "always available on your phone when you sit down to record.",
            s["body_muted"],
        )
    )

    flow.append(PageBreak())

    # ── Section: Feedback channels ──
    flow.append(AccentBar())
    flow.append(Spacer(1, 6))
    flow.append(Paragraph("10 · HOW WE COMMUNICATE", s["eyebrow"]))
    flow.append(Paragraph("Two channels. Both fast.", s["h1"]))
    flow.append(Spacer(1, 8))

    flow.append(Paragraph("Funnel changes (copy, layout, audience)", s["h3"]))
    flow.append(
        Paragraph(
            "Click \"View funnel\" on any audience card in the portal → "
            "\"+ Note\" button → type your note → Send. Ben gets it via SMS "
            "+ email and ships within one business day.",
            s["body"],
        )
    )

    flow.append(Spacer(1, 8))
    flow.append(Paragraph("Everything else", s["h3"]))
    flow.append(
        Paragraph(
            "Text or email Ben directly. Phone number was in your kickoff "
            "email. Team email: <b>bluejaycontactme@gmail.com</b>.",
            s["body"],
        )
    )

    flow.append(Spacer(1, 20))
    flow.append(Paragraph("Brand voice reference", s["h3"]))
    flow.append(
        Paragraph(
            "Every email, SMS, ad, and AI-drafted reply that goes out in "
            "TEKKY's name follows the locked voice rules in your separate "
            "<b>Brand Voice</b> reference packet. Read the \"Voice rules\" "
            "and \"Forbidden words\" sections once. If you notice copy "
            "drifting from this voice, flag it via the feedback path above.",
            s["body_muted"],
        )
    )

    flow.append(Spacer(1, 28))
    flow.append(Divider(NAVY, 0.8))
    flow.append(Spacer(1, 18))
    flow.append(Paragraph("Sign-off", s["h2"]))
    flow.append(
        Paragraph(
            "By signing below, Paul acknowledges receipt of the portal, "
            "login credential, Phase A scope, account-creation authorization, "
            "and card-on-file policy as described in this packet. Sign-off "
            "doesn't lock you into anything — it's the milestone marker for "
            "the start of Phase A.",
            s["body_muted"],
        )
    )
    flow.append(Spacer(1, 18))
    flow.append(FillLine("Paul Hanson — signature:", label_width=2.6 * inch))
    flow.append(Spacer(1, 10))
    flow.append(FillLine("Date:", label_width=2.6 * inch))

    doc.build(flow)
    print(f"  [ok] {out.name}")


# ────────────────────────────────────────────────────────────────────
#  PDF 2 — walkthrough-prep.pdf  (Ben-facing prep sheet)
# ────────────────────────────────────────────────────────────────────
def build_walkthrough_prep(s: dict[str, ParagraphStyle]) -> None:
    out = OUT / "tekky-walkthrough-prep.pdf"
    doc = make_doc(
        out,
        "Walkthrough Prep · Ben Only",
        "Internal prep · do not share",
    )
    flow: list = []

    # Cover
    flow.append(Spacer(1, 0.9 * inch))
    logo = make_logo_drawing(target_height=44)
    if logo is not None:
        flow.append(logo)
    flow.append(Spacer(1, 14))
    flow.append(AccentBar(AMBER))
    flow.append(Spacer(1, 14))
    flow.append(Paragraph("WALKTHROUGH PREP SHEET", s["cover_eyebrow"]))
    flow.append(Paragraph("Tekky backend tour<br/>script + checklist.", s["cover_title"]))
    flow.append(Spacer(1, 6))
    flow.append(
        Paragraph(
            "Ben-facing prep doc for the 90-minute backend tour with "
            "Paul + Philip. Originally written for the 2026-05-13 walkthrough; "
            "still the master reference for any future Tekky meeting.",
            s["cover_subtitle"],
        )
    )
    flow.append(Spacer(1, 18))
    flow.append(
        Paragraph(
            "Founders: <b>Paul Hanson · Philip Lund</b>",
            s["cover_meta"],
        )
    )
    flow.append(
        Paragraph(
            "Portal: <b>https://bluejayportfolio.com/clients/zenith-sports/login</b>",
            s["cover_meta"],
        )
    )
    flow.append(PageBreak())

    # ── Pre-meeting checklist ──
    flow.append(AccentBar(AMBER))
    flow.append(Spacer(1, 6))
    flow.append(Paragraph("PRE-MEETING", s["eyebrow"]))
    flow.append(Paragraph("Run these before you log in.", s["h1"]))
    flow.append(Spacer(1, 6))

    flow.append(Paragraph("DB prep", s["h3"]))
    for item in [
        "Paul + Philip failed_attempts reset to 0",
        "All 6 subscription rows seeded (claude=Pro/$149, hyperloop=none, "
        "twilio/sendgrid/meta-ads/google-ads seeded)",
    ]:
        flow.append(Checkbox(item))
        flow.append(Spacer(1, 4))

    flow.append(Spacer(1, 8))
    flow.append(Paragraph("Login test (incognito)", s["h3"]))
    for item in [
        "Paul login works → tekky-walkthrough-paul-2026",
        "Philip login works → tekky-walkthrough-philip-2026",
        "If either fails, run emergency reset SQL (see runbook)",
    ]:
        flow.append(Checkbox(item))
        flow.append(Spacer(1, 4))

    flow.append(Spacer(1, 8))
    flow.append(Paragraph("Pricing reconciliation", s["h3"]))
    flow.append(
        Paragraph(
            "Confirm doc says: $10,000 in 4 quarterly installments of "
            "$2,500. Q1 due at launch. (Pay-in-full discount of $300 "
            "not applied — Tekky is on the 4-installment plan.)",
            s["body_muted"],
        )
    )
    flow.append(Spacer(1, 6))
    flow.append(FillLine("Stripe sub action taken:", label_width=2.4 * inch))
    flow.append(Spacer(1, 6))
    flow.append(FillLine("Q1 payment link URL:", label_width=2.4 * inch))

    flow.append(PageBreak())

    # ── Script (90 min) ──
    flow.append(AccentBar(AMBER))
    flow.append(Spacer(1, 6))
    flow.append(Paragraph("SCRIPT · 90 MIN WINDOW", s["eyebrow"]))
    flow.append(Paragraph("Stay on track. Talk less than them.", s["h1"]))

    segments = [
        (
            "0–5 min — open with framing",
            "“The website you saw is the storefront. What I want to show you "
            "today is what actually runs the sales engine behind it. The "
            "website is one of seven things this system does — and you're "
            "paying for the system, not the page.”",
        ),
        (
            "5–25 min — Leads tab (heart)",
            "Lead with audience filter ON. Show: ~1,000 leads in system, "
            "color-coded audience strip, Cmd-K search, click a lead → "
            "expand notes + history + 4 touch actions, bulk-select 5 "
            "→ toolbar → bulk Log email or Start funnel. "
            "<b>Sell line:</b> “Every parent that hits any of your "
            "touchpoints shows up here within minutes. Not next week "
            "in a CSV. Now.”",
        ),
        (
            "25–40 min — To-Do tab",
            "Show ~25 active tasks (10 yours, 13 theirs, 2 blocked). Filter "
            "by owner. Bulk-actions: mark done, send back to Ben. Walk "
            "through ONE of their pending items live. <b>Sell line:</b> "
            "“This isn't a Slack channel. You can see who's holding the "
            "ball at every moment, and so can I.”",
        ),
        (
            "40–55 min — Insights / Subscriptions",
            "Claude Pro $149/mo = AI gating (unlocks Reply Drafter + audience "
            "auto-detection). Hyperloop = Off (flip after 50+ leads/week). "
            "Twilio + Meta Ads + Google Ads = Paused (come online "
            "Phase A). <b>Sell line:</b> “Subscription model is the "
            "gear shift. We're not upselling — we're making sure you "
            "don't pay for horsepower you don't need yet.”",
        ),
        (
            "55–70 min — Ads tab + AI Operator preview",
            "Ads tab: 43 creatives across Meta + Google + Lob. AI Operator: "
            "5 mock skills (Lead Reply Drafter wk1 · Audience Detector "
            "wk1 · Drill of Week LIVE · Customer Save Agent wk3 · Lead "
            "Scorer wk4). <b>Sell line:</b> “Each of these replaces "
            "an hour-per-week of your time. Stacked = 5+ hours back to "
            "you. That's the ROI calc.”",
        ),
        (
            "70–85 min — Their 5 walkthrough questions",
            "See next page — bring these up if Paul + Philip don't.",
        ),
        (
            "85–90 min — close + next step",
            "“Two things to leave with: bookmark the portal URL, and "
            "change your passwords. I'll send you the onboarding-handoff "
            "PDF so you've got everything in writing. Phase A kicks off "
            "the moment you reply to that email with the access we "
            "discussed.”",
        ),
    ]
    for title, body in segments:
        flow.append(Paragraph(title, s["h3"]))
        flow.append(Paragraph(body, s["body"]))
        flow.append(Spacer(1, 6))

    flow.append(PageBreak())

    # ── 5 questions to answer in-meeting ──
    flow.append(AccentBar(AMBER))
    flow.append(Spacer(1, 6))
    flow.append(Paragraph("THE 5 QUESTIONS", s["eyebrow"]))
    flow.append(Paragraph("Capture their answers here.", s["h1"]))
    flow.append(Spacer(1, 6))

    questions = [
        "1. Which of you is the primary portal user (Paul vs. Philip)?",
        "2. 4th audience added before Phase A (e.g., \"trainer\" / \"academy\"), "
        "or stick with parent/coach/player/club?",
        "3. Comfortable with temp passwords, or want fresh ones via Signal?",
        "4. Twilio: local Pacific NW number, or vanity (e.g. 1-855-TEKKY-01)?",
        "5. Voicemail clips — when can Philip block 30 min to record the 3 "
        "templates?",
    ]
    for q in questions:
        flow.append(Paragraph(q, s["h3"]))
        flow.append(WriteBox("", lines=3))
        flow.append(Spacer(1, 4))

    flow.append(PageBreak())

    # ── Post-meeting actions ──
    flow.append(AccentBar(AMBER))
    flow.append(Spacer(1, 6))
    flow.append(Paragraph("POST-MEETING", s["eyebrow"]))
    flow.append(Paragraph("Lock the work in.", s["h1"]))
    flow.append(Spacer(1, 6))

    for item in [
        "Email Paul + Philip the onboarding-handoff PDF",
        "Confirm both temp passwords have been changed",
        "Pre-edit the pricing rows in handoff doc to match reconciled tier",
        "Update memory/project_zenith_tekky.md with meeting outcomes",
        "Schedule Phase A kickoff call",
    ]:
        flow.append(Checkbox(item))
        flow.append(Spacer(1, 4))

    flow.append(Spacer(1, 14))
    flow.append(Paragraph("Meeting notes / vibes / open items", s["h3"]))
    flow.append(WriteBox("", lines=8))

    doc.build(flow)
    print(f"  [ok] {out.name}")


# ────────────────────────────────────────────────────────────────────
#  PDF 3 — brand-voice.pdf  (Reference, no fields)
# ────────────────────────────────────────────────────────────────────
def build_brand_voice(s: dict[str, ParagraphStyle]) -> None:
    out = OUT / "tekky-brand-voice.pdf"
    doc = make_doc(
        out,
        "Brand Voice · Tekky",
        "Reference · brand-voice locked rules",
    )
    flow: list = []

    # Cover
    flow.append(Spacer(1, 0.9 * inch))
    logo = make_logo_drawing(target_height=48)
    if logo is not None:
        flow.append(logo)
    flow.append(Spacer(1, 16))
    flow.append(AccentBar(LIME))
    flow.append(Spacer(1, 14))
    flow.append(Paragraph("BRAND VOICE REFERENCE", s["cover_eyebrow"]))
    flow.append(Paragraph("Tekky speaks like<br/>a coach who's seen<br/>5,000 sessions.", s["cover_title"]))
    flow.append(Spacer(1, 8))
    flow.append(
        Paragraph(
            "The locked voice rules every email, SMS, ad, and AI-drafted "
            "reply follows when it goes out in TEKKY's name. Read once. "
            "Flag anything that drifts.",
            s["cover_subtitle"],
        )
    )
    flow.append(Spacer(1, 18))
    flow.append(
        Paragraph(
            "Prepared for: <b>Paul Hanson</b>",
            s["cover_meta"],
        )
    )
    flow.append(Spacer(1, 14))
    flow.append(
        Paragraph(
            "<b>Confirm receipt online (click + type to fill, or print + "
            "handwrite):</b><br/>"
            "<font face='Courier' size='10'>"
            "bluejayportfolio.com/sign/zenith-sports/brand-voice"
            "</font>",
            s["body_muted"],
        )
    )
    flow.append(PageBreak())

    # The voice
    flow.append(AccentBar(LIME))
    flow.append(Spacer(1, 6))
    flow.append(Paragraph("01 · THE VOICE", s["eyebrow"]))
    flow.append(Paragraph("Coach. Not marketer.", s["h1"]))
    flow.append(
        Paragraph(
            "Tekky doesn't sell. Tekky <b>coaches</b>. Every word that "
            "leaves the brand has to pass this test: would a coach who's "
            "seen 5,000 youth-soccer sessions actually say this out loud "
            "to a parent on the sideline?",
            s["body"],
        )
    )

    flow.append(Spacer(1, 12))
    flow.append(Paragraph("Voice rules", s["h2"]))
    for rule in [
        "<b>Specific over abstract.</b> “First touch in tight space” beats "
        "“improve technique.” Always name the moment.",
        "<b>Player-first.</b> The kid is the hero. The parent is the funder. "
        "Tekky is the tool. Never confuse the order.",
        "<b>Earned, not given.</b> Skill is earned. Confidence is earned. "
        "Wins are earned. We sell the work, not the magic.",
        "<b>Calm under pressure.</b> No hype words, no caps-lock, no "
        "exclamation-point storms. Coaches who scream don't last.",
        "<b>One idea per sentence.</b> Parents read these on phones in "
        "carline. If they have to re-read, we lost them.",
    ]:
        flow.append(Paragraph(f"• {rule}", s["bullet"]))

    flow.append(Spacer(1, 12))
    flow.append(Paragraph("Forbidden words", s["h2"]))
    flow.append(
        Paragraph(
            "These get cut on every pass. They make us sound like every "
            "other youth-sports brand. They are off-brand.",
            s["body_muted"],
        )
    )
    flow.append(Spacer(1, 4))
    forbidden = [
        "“Revolutionary” / “game-changing” / “next-level”",
        "“Synergy” / “solutions” / “leverage”",
        "“Just” (as in “just $59.95”) — undermines the price",
        "“Unleash” / “unlock your potential” / “take it to the next level”",
        "“At the end of the day” / “moving forward” / “circle back”",
        "“ROI” / “KPI” / acronyms generally",
    ]
    for word in forbidden:
        flow.append(Paragraph(f"• {word}", s["bullet"]))

    flow.append(PageBreak())

    # Audience-specific tone
    flow.append(AccentBar(LIME))
    flow.append(Spacer(1, 6))
    flow.append(Paragraph("02 · AUDIENCE", s["eyebrow"]))
    flow.append(Paragraph("Same voice. Different lens.", s["h1"]))

    audience_data = [
        [
            Paragraph("<b>🟡 Parent</b>", s["body"]),
            Paragraph(
                "<b>Concern:</b> is my kid wasting time? Will this help? "
                "<b>Trigger:</b> watching their kid plateau. <b>What lands:</b> "
                "specific outcomes (“first touch under pressure”), real "
                "playing-time stories, “before/after” evidence. <b>What "
                "doesn't:</b> hype, gimmicks, “feel the difference.”",
                s["body_muted"],
            ),
        ],
        [
            Paragraph("<b>🔵 Coach</b>", s["body"]),
            Paragraph(
                "<b>Concern:</b> does this fit my session plan? Will my "
                "players actually use it? <b>Trigger:</b> seeing a player "
                "ahead of their level after summer. <b>What lands:</b> drill "
                "specifics, weight + size data, training cycle integration. "
                "<b>What doesn't:</b> parent-focused emotional copy.",
                s["body_muted"],
            ),
        ],
        [
            Paragraph("<b>🟢 Player</b>", s["body"]),
            Paragraph(
                "<b>Concern:</b> will I look good with this? Will I get "
                "better fast? <b>Trigger:</b> losing 1-v-1s they used to "
                "win. <b>What lands:</b> short reels, peer evidence, "
                "“train like the pros.” <b>What doesn't:</b> long-form "
                "copy, parent-coded language.",
                s["body_muted"],
            ),
        ],
        [
            Paragraph("<b>🟣 Club</b>", s["body"]),
            Paragraph(
                "<b>Concern:</b> volume pricing, branding control, can "
                "we white-label. <b>Trigger:</b> board pressure to "
                "modernize. <b>What lands:</b> data on retention + skill "
                "progression, bulk-order terms. <b>What doesn't:</b> "
                "consumer-grade emotional copy.",
                s["body_muted"],
            ),
        ],
    ]
    aud_table = Table(
        audience_data,
        colWidths=[1.1 * inch, doc.width - 1.1 * inch],
    )
    aud_table.setStyle(
        TableStyle(
            [
                ("ROWBACKGROUNDS", (0, 0), (-1, -1), [WHITE, LIGHT]),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 9),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LINEABOVE", (0, 0), (-1, 0), 0.4, NAVY),
                ("LINEBELOW", (0, -1), (-1, -1), 0.4, NAVY),
            ]
        )
    )
    flow.append(aud_table)

    flow.append(PageBreak())

    # Examples (good vs bad)
    flow.append(AccentBar(LIME))
    flow.append(Spacer(1, 6))
    flow.append(Paragraph("03 · EXAMPLES", s["eyebrow"]))
    flow.append(Paragraph("Good vs. off-brand.", s["h1"]))

    pairs = [
        (
            "Subject line (parent funnel · touch 1)",
            "❌ “Unleash your kid's potential with TEKKY!”",
            "✅ “The drill that fixed my son's first touch in 14 days.”",
        ),
        (
            "Body copy (parent funnel)",
            "❌ “Revolutionary training ball that takes skill to the next level.”",
            "✅ “Smaller than a regulation ball. Same match-day weight. "
            "Players who train with it for two weeks tell us their first "
            "touch feels different the moment they switch back.”",
        ),
        (
            "Coach DM",
            "❌ “We have synergistic solutions for your training program.”",
            "✅ “Two of your players already train with this. Want a club "
            "discount code for the rest of the roster?”",
        ),
        (
            "AI-drafted reply (player inquiry)",
            "❌ “Thanks for your interest! At the end of the day, our "
            "product helps unleash your potential!”",
            "✅ “Hey — yeah, plenty of high-school players train with the "
            "TEKKY. Size 3 control, Size 5 weight. First two weeks you'll "
            "feel slower. Week three you'll feel sharper. That's the "
            "whole pitch.”",
        ),
    ]
    for title, bad, good in pairs:
        flow.append(Paragraph(title, s["h3"]))
        flow.append(Paragraph(bad, s["body_muted"]))
        flow.append(Spacer(1, 2))
        flow.append(Paragraph(good, s["body"]))
        flow.append(Spacer(1, 12))

    flow.append(PageBreak())

    # Sign-off
    flow.append(AccentBar(LIME))
    flow.append(Spacer(1, 6))
    flow.append(Paragraph("04 · ACKNOWLEDGED", s["eyebrow"]))
    flow.append(Paragraph("Confirm voice ownership.", s["h1"]))
    flow.append(
        Paragraph(
            "Sign below to confirm Paul has reviewed these voice rules. "
            "Any copy that ships in Tekky's name from this date forward "
            "follows them. Updates to the voice come through this doc — "
            "never inline in email threads.",
            s["body_muted"],
        )
    )
    flow.append(Spacer(1, 24))
    flow.append(FillLine("Paul Hanson — signature:", label_width=2.6 * inch))
    flow.append(Spacer(1, 10))
    flow.append(FillLine("Date:", label_width=2.6 * inch))

    doc.build(flow)
    print(f"  [ok] {out.name}")


# ────────────────────────────────────────────────────────────────────
#  PDF 4 — sunday-cutover.pdf  (Ben-facing runbook)
# ────────────────────────────────────────────────────────────────────
def build_sunday_cutover(s: dict[str, ParagraphStyle]) -> None:
    out = OUT / "tekky-sunday-cutover.pdf"
    doc = make_doc(
        out,
        "Sunday Cutover Runbook · Ben Only",
        "Internal · print before Sunday 9am PT",
    )
    flow: list = []

    # Cover
    flow.append(Spacer(1, 0.9 * inch))
    logo = make_logo_drawing(target_height=44)
    if logo is not None:
        flow.append(logo)
    flow.append(Spacer(1, 14))
    flow.append(AccentBar(ROSE))
    flow.append(Spacer(1, 14))
    flow.append(Paragraph("SUNDAY CUTOVER RUNBOOK", s["cover_eyebrow"]))
    flow.append(Paragraph("Tekky goes live<br/>2026-05-17, 9:00 AM PT.", s["cover_title"]))
    flow.append(Spacer(1, 6))
    flow.append(
        Paragraph(
            "Minute-by-minute. Print it, screenshot it, keep it open on a "
            "second screen. Goal: zero improvisation between 9am and 10am.",
            s["cover_subtitle"],
        )
    )
    flow.append(Spacer(1, 16))
    flow.append(
        Paragraph(
            "Domain target: <b>tekky.org</b> &nbsp;·&nbsp; "
            "Q1 installment: <b>$2,500</b>",
            s["cover_meta"],
        )
    )
    flow.append(PageBreak())

    # ── Saturday pre-flight ──
    flow.append(AccentBar(ROSE))
    flow.append(Spacer(1, 6))
    flow.append(Paragraph("SATURDAY · PRE-FLIGHT", s["eyebrow"]))
    flow.append(Paragraph("30 minutes total. Do it before lunch.", s["h1"]))
    flow.append(Spacer(1, 6))

    saturday_steps = [
        ("Add tekky.org to Vercel project domains", "2 min · Vercel dashboard"),
        ("Add www.tekky.org to Vercel project domains", "2 min"),
        ("Create Q1 Stripe Payment Link ($2,500 one-time)", "5 min"),
        ("Cancel existing $2,500/mo subscription in Stripe", "3 min"),
        ("Confirm Paul's reply has 4 items (domain, access, email, copy)", "2 min"),
        ("Smoke-test live showcase routes in incognito", "5 min"),
        ("Block Sunday 8:30-10:30 AM PT on calendar", "1 min"),
        ("Send Saturday reminder text to Paul (8 PM PT)", "2 min"),
    ]
    for label, sub in saturday_steps:
        flow.append(Checkbox(f"{label}  ({sub})"))
        flow.append(Spacer(1, 4))

    flow.append(Spacer(1, 10))
    flow.append(FillLine("Q1 Stripe Payment Link URL:", label_width=2.5 * inch))
    flow.append(Spacer(1, 8))
    flow.append(FillLine("Cancelled sub ID:", label_width=2.5 * inch, sublabel="(e.g. sub_1TTcUrRuVfGvONwtu4l9SZY2)"))

    flow.append(PageBreak())

    # ── Sunday morning ──
    flow.append(AccentBar(ROSE))
    flow.append(Spacer(1, 6))
    flow.append(Paragraph("SUNDAY · MORNING", s["eyebrow"]))
    flow.append(Paragraph("8:30 AM PT — pre-call.", s["h1"]))
    flow.append(Spacer(1, 6))

    morning_steps = [
        "Reboot/clear browser caches; open fresh incognito window",
        "Test Paul's temp password at /clients/zenith-sports/login",
        "Test Philip's temp password",
        "If either fails → run emergency reset block (walkthrough doc)",
        "Verify Vercel \"Pending\" status for tekky.org (or \"Valid\")",
        "Test Stripe Payment Link in incognito with $0.50 charge → refund",
        "Open all required tabs: Stripe / Vercel / Supabase / handoff / runbook",
    ]
    for item in morning_steps:
        flow.append(Checkbox(item))
        flow.append(Spacer(1, 4))

    flow.append(Spacer(1, 12))
    flow.append(FillLine("Time pre-call started:", label_width=2.4 * inch))
    flow.append(Spacer(1, 6))
    flow.append(FillLine("Time pre-call complete:", label_width=2.4 * inch))

    flow.append(PageBreak())

    # ── 9 AM call ──
    flow.append(AccentBar(ROSE))
    flow.append(Spacer(1, 6))
    flow.append(Paragraph("9:00 AM PT — THE CALL", s["eyebrow"]))
    flow.append(Paragraph("Open with framing.", s["h1"]))
    flow.append(
        Paragraph(
            "“Morning Paul, morning Philip. Few things to land before we "
            "flip the domain. First — final walkthrough. Second — payment "
            "for Q1. Third — DNS flip and we watch it go live together. "
            "Sound good?”",
            s["quote_amber"],
        )
    )
    flow.append(Spacer(1, 6))
    flow.append(FillLine("Call started at:", label_width=2.4 * inch))

    flow.append(Spacer(1, 14))
    flow.append(Paragraph("9:05 — final walkthrough (~10 min)", s["h2"]))
    walk_items = [
        "Screen-share public showcase /clients/zenith-sports",
        "Walk shop page — confirm CTAs route to their Shopify",
        "Show portal login — remind them to change passwords first login",
        "Show Leads tab — 986 leads, audience colors, search, bulk actions",
        "Ask: \"Any final tweaks before we lock it?\"",
    ]
    for item in walk_items:
        flow.append(Checkbox(item))
        flow.append(Spacer(1, 4))

    flow.append(Spacer(1, 12))
    flow.append(Paragraph("9:15 — collect Q1 payment (~5 min)", s["h2"]))
    flow.append(
        Paragraph(
            "“Quick housekeeping. First quarterly installment is $2,500. "
            "I'm sending you the payment link right now — takes 30 "
            "seconds. Once that clears I'll flip the domain and we watch "
            "it go live together.”",
            s["quote_amber"],
        )
    )
    pay_items = [
        "Sent Stripe Payment Link via iMessage / email / Signal",
        "Confirmed \"Succeeded\" in Stripe dashboard",
        "If they balk → run the rebuttal script in the markdown runbook",
    ]
    for item in pay_items:
        flow.append(Checkbox(item))
        flow.append(Spacer(1, 4))

    flow.append(Spacer(1, 8))
    flow.append(FillLine("Q1 payment cleared at:", label_width=2.4 * inch))
    flow.append(Spacer(1, 6))
    flow.append(FillLine("Stripe charge ID (for receipt):", label_width=2.4 * inch))

    flow.append(
        Paragraph(
            "<b>HARD RULE — no payment = no DNS flip.</b> Reschedule to "
            "Tuesday if needed.",
            s["warn"],
        )
    )

    flow.append(PageBreak())

    # ── DNS flip + propagation ──
    flow.append(AccentBar(ROSE))
    flow.append(Spacer(1, 6))
    flow.append(Paragraph("9:20 — DNS FLIP", s["eyebrow"]))
    flow.append(Paragraph("Paul does it, Ben watches.", s["h1"]))
    flow.append(Spacer(1, 6))
    flow.append(Paragraph("Nameservers Paul enters at his registrar:", s["body"]))
    flow.append(
        Paragraph(
            "<font face='Courier'>ns1.vercel-dns.com</font><br/>"
            "<font face='Courier'>ns2.vercel-dns.com</font>",
            s["mono_box"],
        )
    )
    flow.append(Spacer(1, 6))
    dns_items = [
        "Confirmed Paul saved nameserver change at his registrar",
        "Vercel tekky.org status flipped from Pending → Valid Configuration",
        "tekky.org resolves to Vercel IPs (nslookup tekky.org 8.8.8.8)",
        "SSL certificate auto-provisioned",
    ]
    for item in dns_items:
        flow.append(Checkbox(item))
        flow.append(Spacer(1, 4))

    flow.append(Spacer(1, 10))
    flow.append(FillLine("DNS flip initiated at:", label_width=2.4 * inch))
    flow.append(Spacer(1, 6))
    flow.append(FillLine("Propagation completed at:", label_width=2.4 * inch))

    flow.append(PageBreak())

    # ── Smoke test ──
    flow.append(AccentBar(ROSE))
    flow.append(Spacer(1, 6))
    flow.append(Paragraph("9:45 — SMOKE TEST", s["eyebrow"]))
    flow.append(Paragraph("10 checks. All must pass.", s["h1"]))
    flow.append(
        Paragraph(
            "Run in fresh incognito so no cookies poison the result.",
            s["body_muted"],
        )
    )
    flow.append(Spacer(1, 6))

    smoke = [
        "tekky.org loads Zenith Sports showcase (NOT BlueJays homepage)",
        "www.tekky.org loads same (Vercel handles www → apex)",
        "SSL cert valid — green padlock, no warnings",
        "Hero \"SHOP THE TEKKY\" CTA routes to /clients/zenith-sports/shop",
        "Shop \"BUY ON ZENITH SPORTS\" CTAs route to zenithsports.org Shopify",
        "Email capture form posts successfully (fake email test)",
        "All 6 product photos load on showcase (no broken images)",
        "Footer credit links to bluejayportfolio.com/audit",
        "tekky.org/clients/zenith-sports/login loads portal sign-in",
        "bluejayportfolio.com/clients/zenith-sports/login still works (no regression)",
    ]
    for i, item in enumerate(smoke, 1):
        flow.append(Checkbox(f"{i:>2}. {item}"))
        flow.append(Spacer(1, 4))

    flow.append(Spacer(1, 10))
    flow.append(Paragraph("Failures captured", s["h3"]))
    flow.append(WriteBox("", lines=4))

    flow.append(PageBreak())

    # ── Close + post-call ──
    flow.append(AccentBar(ROSE))
    flow.append(Spacer(1, 6))
    flow.append(Paragraph("10:00 — CLOSE THE CALL", s["eyebrow"]))
    flow.append(Paragraph("3 things. Then end.", s["h1"]))
    flow.append(
        Paragraph(
            "“You're live. Three things before we wrap: (1) Bookmark the "
            "portal URL. (2) Change your passwords first thing. (3) I'm "
            "emailing you the onboarding handoff doc right now. Phase A "
            "kicks off Monday. I'll check in with you Friday.”",
            s["quote_amber"],
        )
    )
    close_items = [
        "Sent handoff PDF email DURING the call",
        "Confirmed they received the email before ending",
        "Confirmed Phase A kickoff timing",
        "Friday check-in scheduled",
    ]
    for item in close_items:
        flow.append(Checkbox(item))
        flow.append(Spacer(1, 4))

    flow.append(Spacer(1, 14))
    flow.append(Paragraph("10:15 — post-call admin (15 min)", s["h2"]))
    admin_items = [
        "Update memory/project_zenith_tekky.md (status, Q1 confirmed, LIVE)",
        "Strike Tekky-walkthrough migration from active_commitments.md",
        "Log to recent_locked_decisions.md",
        "Update CLAUDE.md Client Tenant Status table",
        "Post Day 19 LinkedIn + IG (Tekky launch is the content)",
    ]
    for item in admin_items:
        flow.append(Checkbox(item))
        flow.append(Spacer(1, 4))

    flow.append(PageBreak())

    # ── Emergency table ──
    flow.append(AccentBar(ROSE))
    flow.append(Spacer(1, 6))
    flow.append(Paragraph("IF SOMETHING BLOWS UP", s["eyebrow"]))
    flow.append(Paragraph("Read the symptom. Run the fix.", s["h1"]))
    flow.append(Spacer(1, 10))

    emerg_data = [
        [
            Paragraph("<b>Symptom</b>", s["body"]),
            Paragraph("<b>Fix</b>", s["body"]),
        ],
        [
            Paragraph("tekky.org still hits old registrar after 30 min", s["body_muted"]),
            Paragraph(
                "Confirm with Paul that nameservers were actually saved. "
                "Most failures = Paul changed it but didn't click Save.",
                s["body_muted"],
            ),
        ],
        [
            Paragraph("tekky.org loads BlueJays homepage, not Zenith showcase", s["body_muted"]),
            Paragraph(
                "Middleware rewrite isn't firing. Check src/middleware.ts "
                "→ tekky.org line uncommented? Deployed? Hard-refresh + "
                "clear cache.",
                s["body_muted"],
            ),
        ],
        [
            Paragraph("Vercel shows \"Invalid Configuration\"", s["body_muted"]),
            Paragraph(
                "Nameservers set wrong. Double-check Paul typed "
                "ns1.vercel-dns.com + ns2.vercel-dns.com exactly.",
                s["body_muted"],
            ),
        ],
        [
            Paragraph("SSL cert error", s["body_muted"]),
            Paragraph(
                "Let Vercel finish provisioning — auto-issues within 30 "
                "min of nameservers propagating. After 1 hour: check "
                "Vercel domain settings → request new cert.",
                s["body_muted"],
            ),
        ],
        [
            Paragraph("Stripe link returns \"Price not found\"", s["body_muted"]),
            Paragraph(
                "Product was archived. Create fresh link, send again.",
                s["body_muted"],
            ),
        ],
        [
            Paragraph("Portal login fails for Paul or Philip", s["body_muted"]),
            Paragraph(
                "Run emergency reset block in walkthrough-2026-05-13.md "
                "→ Option A copies your ben-test hash.",
                s["body_muted"],
            ),
        ],
    ]
    emerg_table = Table(
        emerg_data,
        colWidths=[2.5 * inch, doc.width - 2.5 * inch],
    )
    emerg_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT]),
                ("LINEBELOW", (0, 0), (-1, 0), 0.6, NAVY),
                ("LEFTPADDING", (0, 0), (-1, -1), 9),
                ("RIGHTPADDING", (0, 0), (-1, -1), 9),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    flow.append(emerg_table)

    doc.build(flow)
    print(f"  [ok] {out.name}")


def main() -> None:
    print(f"Generating 4 PDFs -> {OUT}\n")
    styles = make_styles()
    build_onboarding_handoff(styles)
    build_walkthrough_prep(styles)
    build_brand_voice(styles)
    build_sunday_cutover(styles)
    print(f"\nDone. {len(list(OUT.glob('*.pdf')))} PDFs written.")


if __name__ == "__main__":
    main()
