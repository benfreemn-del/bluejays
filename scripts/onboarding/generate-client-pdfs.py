"""
Generic AI System onboarding-PDF generator.

Reads a JSON config (see scripts/onboarding/clients/<slug>.json — schema
documented in client-config.ts) and produces 4 client-onboarding PDFs at
public/clients/<slug>/pdfs/:

    1. <slug>-handoff.pdf          — welcome packet + payment links + sign area
    2. <slug>-brand-voice.pdf      — tone + positioning reference
    3. <slug>-sla.pdf              — service-level agreement table
    4. <slug>-value-proof.pdf      — what's-included matrix

Why "generic": Tekky / Zenith Sports shipped via the hand-written
generate-zenith-onboarding-pdfs.py (2320 lines, Zenith-specific). The day
Jake at ITC signs, we'd rather not copy-paste another 2320 lines. This
generic script trades visual polish for portability — any client config
JSON drives a "good enough" 4-PDF bundle in 30 seconds.

For high-touch clients (Tekky's exact polish), keep the hand-written
script alongside this one. For everyone else, this is the default.

Run from repo root:
    python scripts/onboarding/generate-client-pdfs.py --client <slug>

Dependencies (install once per environment):
    pip install reportlab

Optional (logo embedding):
    pip install svglib
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

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
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

# ─── Paths ──────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent
CLIENTS_DIR = SCRIPT_DIR / "clients"
PUBLIC_CLIENTS_DIR = REPO_ROOT / "public" / "clients"


# ─── Config loader ──────────────────────────────────────────────────────
@dataclass
class ClientConfig:
    raw: dict[str, Any]

    @property
    def slug(self) -> str:
        return self.raw["slug"]

    @property
    def business_name(self) -> str:
        return self.raw["businessName"]

    @property
    def internal_name(self) -> str:
        return self.raw.get("internalName") or self.business_name

    @property
    def primary_hex(self) -> colors.Color:
        return colors.HexColor(self.raw["brand"]["primaryHex"])

    @property
    def accent_hex(self) -> colors.Color:
        return colors.HexColor(self.raw["brand"]["accentHex"])

    @property
    def secondary_hex(self) -> colors.Color:
        return colors.HexColor(
            self.raw["brand"].get("secondaryHex", "#475569")
        )

    @property
    def positioning(self) -> str:
        return self.raw["brand"]["positioning"]

    @property
    def primary_contact(self) -> dict[str, str]:
        return {
            "name": self.raw["contact"]["primaryName"],
            "email": self.raw["contact"]["primaryEmail"],
            "role": self.raw["contact"]["primaryRole"],
        }

    @property
    def total_usd(self) -> int:
        return int(self.raw["pricing"]["totalUsd"])

    @property
    def plan_label(self) -> str:
        return self.raw["pricing"]["planLabel"]

    @property
    def installment_usd(self) -> int | None:
        v = self.raw["pricing"].get("installmentUsd")
        return int(v) if v else None

    @property
    def installment_due_dates(self) -> list[str]:
        return list(self.raw["pricing"].get("installmentDueDates") or [])

    @property
    def live_site_url(self) -> str:
        return self.raw["liveSiteUrl"]

    @property
    def payment_links(self) -> list[dict[str, str]]:
        out: list[dict[str, str]] = []
        primary = self.raw["paymentLinks"]["primary"]
        out.append({"label": primary["label"], "env": primary["envVar"]})
        for s in self.raw["paymentLinks"].get("secondary", []) or []:
            out.append({"label": s["label"], "env": s["envVar"]})
        return out

    @property
    def feature_flags(self) -> dict[str, Any]:
        return self.raw.get("featureFlags") or {}

    @property
    def schedule(self) -> dict[str, str]:
        return self.raw.get("schedule") or {}


def load_config(slug: str) -> ClientConfig:
    path = CLIENTS_DIR / f"{slug}.json"
    if not path.exists():
        sys.exit(f"Config not found: {path}")
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    return ClientConfig(raw=data)


# ─── Styles ─────────────────────────────────────────────────────────────
def make_styles(cfg: ClientConfig) -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    primary = cfg.primary_hex
    accent = cfg.accent_hex
    slate = cfg.secondary_hex

    s: dict[str, ParagraphStyle] = {}
    s["cover_eyebrow"] = ParagraphStyle(
        "cover_eyebrow", parent=base["Normal"],
        fontName="Helvetica-Bold", fontSize=10,
        textColor=accent, spaceAfter=10, alignment=TA_LEFT,
    )
    s["cover_title"] = ParagraphStyle(
        "cover_title", parent=base["Title"],
        fontName="Helvetica-Bold", fontSize=34, leading=40,
        textColor=primary, spaceAfter=12, alignment=TA_LEFT,
    )
    s["cover_subtitle"] = ParagraphStyle(
        "cover_subtitle", parent=base["Normal"],
        fontName="Helvetica", fontSize=14, leading=20,
        textColor=slate, spaceAfter=8, alignment=TA_LEFT,
    )
    s["cover_meta"] = ParagraphStyle(
        "cover_meta", parent=base["Normal"],
        fontName="Helvetica", fontSize=10,
        textColor=slate, alignment=TA_LEFT,
    )
    s["h1"] = ParagraphStyle(
        "h1", parent=base["Heading1"],
        fontName="Helvetica-Bold", fontSize=20, leading=26,
        textColor=primary, spaceBefore=14, spaceAfter=10,
    )
    s["h2"] = ParagraphStyle(
        "h2", parent=base["Heading2"],
        fontName="Helvetica-Bold", fontSize=14, leading=18,
        textColor=primary, spaceBefore=14, spaceAfter=6,
    )
    s["body"] = ParagraphStyle(
        "body", parent=base["Normal"],
        fontName="Helvetica", fontSize=10.5, leading=15,
        textColor=colors.HexColor("#1a2438"), spaceAfter=6, alignment=TA_LEFT,
    )
    s["body_bold"] = ParagraphStyle(
        "body_bold", parent=s["body"],
        fontName="Helvetica-Bold",
    )
    s["body_head_white"] = ParagraphStyle(
        "body_head_white", parent=s["body"],
        fontName="Helvetica-Bold", textColor=colors.white,
    )
    s["quote_amber"] = ParagraphStyle(
        "quote_amber", parent=base["Normal"],
        fontName="Helvetica", fontSize=11, leading=16,
        textColor=colors.HexColor("#92400e"),
        backColor=colors.HexColor("#fef3c7"),
        borderColor=colors.HexColor("#f59e0b"),
        borderWidth=1, borderPadding=10,
        spaceBefore=14, spaceAfter=14, leftIndent=0, rightIndent=0,
    )
    s["footer"] = ParagraphStyle(
        "footer", parent=base["Normal"],
        fontName="Helvetica", fontSize=8,
        textColor=slate, alignment=TA_CENTER,
    )
    return s


# ─── Fill line flowable ─────────────────────────────────────────────────
class FillLine(Flowable):
    """Single-line fillable field — label on the left, hairline rule on the right."""

    def __init__(self, label: str, width: float = 6.5 * inch, rule_color=None):
        super().__init__()
        self.label = label
        self.width = width
        self.rule_color = rule_color or colors.HexColor("#94a3b8")
        self.height = 22

    def draw(self):
        c = self.canv
        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(colors.HexColor("#475569"))
        c.drawString(0, 8, self.label)
        label_width = c.stringWidth(self.label, "Helvetica-Bold", 9)
        x_start = label_width + 8
        c.setStrokeColor(self.rule_color)
        c.setLineWidth(0.5)
        c.line(x_start, 6, self.width, 6)


# ─── Page template (header + footer per page) ──────────────────────────
def make_doc(out_path: Path, title: str, footer_note: str) -> BaseDocTemplate:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    doc = BaseDocTemplate(
        str(out_path),
        pagesize=letter,
        leftMargin=0.7 * inch,
        rightMargin=0.7 * inch,
        topMargin=0.7 * inch,
        bottomMargin=0.7 * inch,
        title=title,
        author="BlueJays Business Solutions",
    )
    frame = Frame(
        doc.leftMargin, doc.bottomMargin,
        doc.width, doc.height,
        showBoundary=0, id="content",
    )

    def footer(canvas, _doc):
        canvas.saveState()
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(colors.HexColor("#64748b"))
        canvas.drawString(doc.leftMargin, 0.4 * inch, footer_note)
        canvas.drawRightString(
            letter[0] - doc.rightMargin, 0.4 * inch,
            f"Page {canvas.getPageNumber()}",
        )
        canvas.restoreState()

    doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=footer)])
    return doc


# ─── Common cover block ─────────────────────────────────────────────────
def cover_block(s: dict[str, ParagraphStyle], cfg: ClientConfig, doc_label: str):
    story: list[Any] = []
    story.append(Paragraph(doc_label.upper(), s["cover_eyebrow"]))
    story.append(Paragraph(cfg.business_name, s["cover_title"]))
    story.append(Paragraph(cfg.positioning, s["cover_subtitle"]))
    story.append(Spacer(1, 0.3 * inch))
    story.append(Paragraph(
        f"<b>For:</b> {cfg.primary_contact['name']} "
        f"({cfg.primary_contact['role']})",
        s["cover_meta"],
    ))
    story.append(Paragraph(
        f"<b>Live at:</b> {cfg.live_site_url}",
        s["cover_meta"],
    ))
    if cfg.schedule.get("goLiveAt"):
        story.append(Paragraph(
            f"<b>Target go-live:</b> {cfg.schedule['goLiveAt']}",
            s["cover_meta"],
        ))
    story.append(Spacer(1, 0.4 * inch))
    story.append(HRFlowable(width="100%", thickness=0.5,
                            color=cfg.secondary_hex, spaceBefore=4, spaceAfter=18))
    return story


# ─── PDF 1 — Handoff packet ─────────────────────────────────────────────
def build_handoff(cfg: ClientConfig, s: dict[str, ParagraphStyle]) -> list[Any]:
    story = cover_block(s, cfg, "Onboarding · Handoff")
    primary = cfg.primary_contact
    contact_line = f"{primary['name']} · {primary['role']} · {primary['email']}"

    story.append(Paragraph("Welcome", s["h1"]))
    story.append(Paragraph(
        f"This packet is your one-page reference for the BlueJays AI Marketing "
        f"System build for {cfg.business_name}. Everything that ships in your "
        f"package is named below, with the pricing structure, payment links, "
        f"and a single-page sign-off you can drop back to "
        f"<b>ben@bluejayportfolio.com</b> via PDF or print.",
        s["body"],
    ))

    story.append(Paragraph("Pricing", s["h2"]))
    plan = cfg.plan_label
    total = cfg.total_usd
    if plan == "pay-in-full":
        plan_body = (
            f"Pay-in-full plan — ${total:,} due at signing. Includes the "
            f"$300 pay-in-full discount from the $10,000 list price."
        )
    elif plan == "4-quarter":
        per = cfg.installment_usd or (total // 4)
        plan_body = (
            f"Quarterly installment plan — ${per:,} per quarter × 4 = "
            f"${total:,} total. "
        )
        if cfg.installment_due_dates:
            plan_body += "Due dates: " + ", ".join(cfg.installment_due_dates) + "."
    else:
        plan_body = f"Custom plan — ${total:,} total. Schedule as per contract."
    story.append(Paragraph(plan_body, s["body"]))

    story.append(Paragraph("Payment Links", s["h2"]))
    for link in cfg.payment_links:
        story.append(Paragraph(
            f"• <b>{link['label']}</b> — Stripe link via env var "
            f"<font face='Courier'>{link['env']}</font>",
            s["body"],
        ))

    story.append(Paragraph("What's running today", s["h2"]))
    ff = cfg.feature_flags
    bullets = []
    if ff.get("aiOperator"):
        bullets.append("AI Operator (per-prospect agentic responder + Madie's draft queue)")
    if ff.get("hyperloopWeekly"):
        bullets.append("Hyperloop (weekly auto-optimize on ad creatives + landing-page variants)")
    if ff.get("affiliatePipeline"):
        bullets.append("Affiliate pipeline (partner-recruitment + automated commission tracking)")
    if ff.get("weeklyReports"):
        bullets.append("Weekly reports (every Monday — lead volume + ad spend + close-rate)")
    for v in ff.get("verticalExtras") or []:
        bullets.append(v)
    if not bullets:
        bullets.append("(No feature flags set — see config)")
    for b in bullets:
        story.append(Paragraph(f"• {b}", s["body"]))

    story.append(Paragraph("Sign-off", s["h2"]))
    story.append(Paragraph(
        "Drop in your name + date and email this back to confirm the package.",
        s["body"],
    ))
    story.append(Spacer(1, 8))
    story.append(FillLine("Name:"))
    story.append(Spacer(1, 8))
    story.append(FillLine("Date:"))
    story.append(Spacer(1, 8))
    story.append(FillLine("Signature:"))

    story.append(Spacer(1, 0.3 * inch))
    story.append(Paragraph(
        f"<i>Primary contact: {contact_line}</i>",
        s["cover_meta"],
    ))
    return story


# ─── PDF 2 — Brand voice ────────────────────────────────────────────────
def build_brand_voice(cfg: ClientConfig, s: dict[str, ParagraphStyle]) -> list[Any]:
    story = cover_block(s, cfg, "Brand · Voice + Tone")

    story.append(Paragraph("Voice in three words", s["h1"]))
    story.append(Paragraph(
        "Fill in three words your customers would use to describe how "
        f"{cfg.business_name} sounds at its best. AIOS uses these to keep "
        "every customer-facing draft on-brand.",
        s["body"],
    ))
    for label in ("Word 1:", "Word 2:", "Word 3:"):
        story.append(Spacer(1, 6))
        story.append(FillLine(label))

    story.append(Paragraph("Lines I'd never say", s["h1"]))
    story.append(Paragraph(
        "Drop 3-5 phrases AIOS should NEVER put in your name. Industry "
        "clichés, marketing-speak, anything that sounds like a stock ad.",
        s["body"],
    ))
    for label in ("1.", "2.", "3.", "4.", "5."):
        story.append(Spacer(1, 6))
        story.append(FillLine(label))

    story.append(Paragraph("Reference samples", s["h1"]))
    story.append(Paragraph(
        f"Paste 3-5 customer-facing artifacts that sound like {cfg.business_name} "
        "at its best — emails, social posts, sales-call quotes, web copy. AIOS "
        "trains its draft style on these. Reuse customer-support transcripts or "
        "Google review responses when stuck.",
        s["body"],
    ))

    return story


# ─── PDF 3 — SLA ────────────────────────────────────────────────────────
def build_sla(cfg: ClientConfig, s: dict[str, ParagraphStyle]) -> list[Any]:
    story = cover_block(s, cfg, "Service-Level Agreement")

    story.append(Paragraph("What BlueJays commits to", s["h1"]))

    rows = [
        ["Item", "Commitment", "Cadence"],
        ["Site uptime", "99% monthly", "Continuous"],
        ["Lead-form response", "Auto-reply within 30 sec", "Continuous"],
        ["Bug fix — production", "Same-day patch", "On report"],
        ["Bug fix — non-production", "≤ 5 business days", "On report"],
        ["Content updates", "≤ 2 business days", "On request"],
        ["Strategic check-in", "30 min", "Monthly"],
        ["Weekly report", "Lead volume + ad spend + close-rate", "Mondays 7am PT"],
    ]
    head_row = [Paragraph(c, s["body_head_white"]) for c in rows[0]]
    body_rows = [
        [Paragraph(c, s["body"]) for c in row]
        for row in rows[1:]
    ]
    t = Table([head_row] + body_rows, colWidths=[1.8 * inch, 3.2 * inch, 1.5 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), cfg.primary_hex),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#f8fafc")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1),
         [colors.HexColor("#f8fafc"), colors.HexColor("#f1f5f9")]),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#cbd5e1")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(t)

    story.append(Paragraph("Escalation path", s["h2"]))
    story.append(Paragraph(
        "Step 1: Email ben@bluejayportfolio.com. Step 2: If no reply in "
        "4 business hours, text Ben directly (number in the welcome email). "
        "Step 3: If still unresolved in 24 hours, schedule a 15-min sync via "
        "the Calendly link in your welcome email.",
        s["body"],
    ))

    story.append(Paragraph(
        "<b>Note:</b> This SLA covers the BlueJays-managed surface. Third-"
        "party outages (Stripe, Twilio, SendGrid, your registrar) are tracked "
        "but resolution windows depend on the vendor.",
        s["quote_amber"],
    ))
    return story


# ─── PDF 4 — Value proof ────────────────────────────────────────────────
def build_value_proof(cfg: ClientConfig, s: dict[str, ParagraphStyle]) -> list[Any]:
    story = cover_block(s, cfg, "Value · What's Included")

    story.append(Paragraph("What you get for your investment", s["h1"]))
    story.append(Paragraph(
        f"The $10,000 BlueJays AI System for {cfg.business_name} includes "
        "everything below. Standalone agency cost in parentheses. Total "
        "stand-alone value listed at the end.",
        s["body"],
    ))

    rows = [
        ["Module", "What it does", "Standalone"],
        ["Custom bespoke website",
         f"Designed for {cfg.business_name}, hosted + maintained for 1 yr",
         "$8,000"],
        ["Domain registration + hosting",
         "Namecheap registration + Vercel hosting setup", "$200"],
        ["AI Operator",
         "Per-prospect agentic responder + Madie draft queue", "$6,000"],
        ["Hyperloop",
         "Weekly auto-optimize on ad creatives + LP variants", "$4,800"],
        ["Affiliate pipeline",
         "Partner recruitment + commission tracking + payout flow", "$3,600"],
        ["Weekly reports",
         "Mondays 7am PT — leads + ad spend + close-rate", "$2,400"],
    ]
    extras = (cfg.feature_flags.get("verticalExtras") or [])
    for extra in extras:
        rows.append([extra.title(), f"Vertical-specific feature for {cfg.business_name}", "$2,000"])

    head_row = [Paragraph(c, s["body_head_white"]) for c in rows[0]]
    body_rows = [
        [Paragraph(c, s["body"]) for c in row]
        for row in rows[1:]
    ]
    t = Table([head_row] + body_rows, colWidths=[1.7 * inch, 3.3 * inch, 1.2 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), cfg.primary_hex),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1),
         [colors.HexColor("#f8fafc"), colors.HexColor("#f1f5f9")]),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#cbd5e1")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("ALIGN", (2, 0), (2, -1), "RIGHT"),
    ]))
    story.append(t)

    standalone_total = 8000 + 200 + 6000 + 4800 + 3600 + 2400 + (2000 * len(extras))
    discount = cfg.total_usd
    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph(
        f"<b>Standalone agency total: ${standalone_total:,}</b><br/>"
        f"<b>Your BlueJays price: ${discount:,}</b><br/>"
        f"<b>You save: ${standalone_total - discount:,}</b>",
        s["body_bold"],
    ))

    story.append(Paragraph(
        "<b>Why the gap?</b> Standalone numbers reflect what each line item "
        "would cost from a specialist agency (web design boutique + AI dev "
        "shop + ads agency + reporting consultant). BlueJays delivers all "
        "four through one pipeline, which is the entire reason this offer "
        "exists.",
        s["quote_amber"],
    ))
    return story


# ─── Main ───────────────────────────────────────────────────────────────
def generate(slug: str) -> list[Path]:
    cfg = load_config(slug)
    s = make_styles(cfg)
    out_dir = PUBLIC_CLIENTS_DIR / cfg.slug / "pdfs"

    pdfs = [
        ("handoff", "Onboarding Handoff", build_handoff),
        ("brand-voice", "Brand Voice", build_brand_voice),
        ("sla", "Service-Level Agreement", build_sla),
        ("value-proof", "Value Proof", build_value_proof),
    ]

    written: list[Path] = []
    for kind, title, builder in pdfs:
        out = out_dir / f"{cfg.slug}-{kind}.pdf"
        doc = make_doc(
            out,
            f"{cfg.business_name} — {title}",
            f"BlueJays AI System · {cfg.business_name} · {kind}",
        )
        doc.build(builder(cfg, s))
        written.append(out)
        print(f"  ✓ {out.relative_to(REPO_ROOT)}")

    return written


def main():
    parser = argparse.ArgumentParser(
        description="Generate AI System onboarding PDFs from a client config."
    )
    parser.add_argument(
        "--client", required=True,
        help="Client slug (matches scripts/onboarding/clients/<slug>.json)",
    )
    args = parser.parse_args()

    print(f"Generating PDFs for: {args.client}")
    written = generate(args.client)
    print(f"\nDone — {len(written)} PDFs.")


if __name__ == "__main__":
    main()
