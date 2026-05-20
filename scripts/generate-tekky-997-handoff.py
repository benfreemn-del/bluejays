"""
Generate the TEKKY $997 + tax Phase 1 onboarding handoff PDF.

Replaces the original tekky-onboarding-handoff.pdf which was scoped to
the $10K AI Marketing System (4-installment plan). Paul + Philip pulled
back on 2026-05-20 and chose the standard $997 + tax site + SEO Phase 1
instead, with Phase 2 (the full AI System) remaining available later.

Output: bluejays/public/clients/zenith-sports/pdfs/tekky-onboarding-handoff.pdf

Run from the bluejays/ directory:
    py scripts/generate-tekky-997-handoff.py
"""

from pathlib import Path
from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    PageBreak,
    Table,
    TableStyle,
    KeepTogether,
    Flowable,
)


# ─── Brand palette ─────────────────────────────────────────────────────
TEKKY_NAVY = HexColor("#0b1730")
TEKKY_BLUE = HexColor("#1e40af")
TEKKY_LIME = HexColor("#84cc16")
WARM_GRAY = HexColor("#475569")
SOFT_BG = HexColor("#f8fafc")
AMBER_BG = HexColor("#fef3c7")
AMBER_BORDER = HexColor("#f59e0b")


# ─── Styles ────────────────────────────────────────────────────────────
def build_styles():
    base = getSampleStyleSheet()
    s = {}
    s["title"] = ParagraphStyle(
        "title",
        parent=base["Title"],
        fontName="Helvetica-Bold",
        fontSize=26,
        leading=32,
        textColor=TEKKY_NAVY,
        alignment=TA_LEFT,
        spaceAfter=4,
    )
    s["subtitle"] = ParagraphStyle(
        "subtitle",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=13,
        leading=18,
        textColor=WARM_GRAY,
        spaceAfter=18,
    )
    s["h1"] = ParagraphStyle(
        "h1",
        parent=base["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=24,
        textColor=TEKKY_NAVY,
        spaceBefore=18,
        spaceAfter=8,
    )
    s["h2"] = ParagraphStyle(
        "h2",
        parent=base["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=18,
        textColor=TEKKY_BLUE,
        spaceBefore=12,
        spaceAfter=4,
    )
    s["body"] = ParagraphStyle(
        "body",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=11,
        leading=16,
        textColor=HexColor("#1f2937"),
        spaceAfter=8,
    )
    s["body_head"] = ParagraphStyle(
        "body_head",
        parent=base["Normal"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=15,
        textColor=white,
    )
    s["body_cell"] = ParagraphStyle(
        "body_cell",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=HexColor("#1f2937"),
    )
    s["bullet"] = ParagraphStyle(
        "bullet",
        parent=s["body"],
        leftIndent=14,
        bulletIndent=2,
        spaceAfter=4,
    )
    s["quote_amber"] = ParagraphStyle(
        "quote_amber",
        parent=base["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=11,
        leading=16,
        textColor=HexColor("#92400e"),
        backColor=AMBER_BG,
        borderColor=AMBER_BORDER,
        borderWidth=1,
        borderPadding=10,
        spaceBefore=14,
        spaceAfter=14,
    )
    s["caption"] = ParagraphStyle(
        "caption",
        parent=base["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=9,
        leading=13,
        textColor=WARM_GRAY,
        spaceAfter=10,
    )
    s["sig_label"] = ParagraphStyle(
        "sig_label",
        parent=base["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13,
        textColor=TEKKY_NAVY,
        spaceAfter=2,
    )
    return s


# ─── Custom flowable for clean signature lines ─────────────────────────
class FillLine(Flowable):
    """A hairline rule that prints + previews as a clickable signature line."""

    def __init__(self, width=4.5 * inch, height=0.2 * inch):
        super().__init__()
        self.width = width
        self.height = height

    def draw(self):
        self.canv.setStrokeColor(HexColor("#94a3b8"))
        self.canv.setLineWidth(0.5)
        self.canv.line(0, 4, self.width, 4)


# ─── Page header / footer ──────────────────────────────────────────────
def _header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica-Bold", 9)
    canvas.setFillColor(TEKKY_NAVY)
    canvas.drawString(0.75 * inch, LETTER[1] - 0.5 * inch, "TEKKY · Phase 1 Welcome Packet")
    canvas.setFont("Helvetica", 9)
    canvas.setFillColor(WARM_GRAY)
    canvas.drawRightString(
        LETTER[0] - 0.75 * inch,
        LETTER[1] - 0.5 * inch,
        "BlueJays · bluejayportfolio.com",
    )
    canvas.setStrokeColor(HexColor("#e2e8f0"))
    canvas.setLineWidth(0.5)
    canvas.line(
        0.75 * inch,
        LETTER[1] - 0.6 * inch,
        LETTER[0] - 0.75 * inch,
        LETTER[1] - 0.6 * inch,
    )
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(WARM_GRAY)
    canvas.drawString(
        0.75 * inch,
        0.5 * inch,
        f"Page {doc.page} · Sign at: bluejayportfolio.com/sign/zenith-sports/handoff",
    )
    canvas.restoreState()


# ─── Document body ─────────────────────────────────────────────────────
def build_story(s):
    story = []

    # Cover block
    story.append(Paragraph("TEKKY · Phase 1", s["title"]))
    story.append(Paragraph(
        "Website + SEO Foundation Welcome Packet",
        ParagraphStyle(
            "cover_sub",
            parent=s["subtitle"],
            fontSize=15,
            textColor=TEKKY_BLUE,
            fontName="Helvetica-Bold",
            spaceAfter=6,
        ),
    ))
    story.append(Paragraph(
        "Prepared for Paul + Philip · Zenith Sports · 2026-05-20",
        s["caption"],
    ))

    story.append(Paragraph(
        "Sign + acknowledge at <font color='#1e40af'><b>"
        "bluejayportfolio.com/sign/zenith-sports/handoff</b></font>",
        s["caption"],
    ))

    story.append(Spacer(1, 0.15 * inch))

    # Intro
    story.append(Paragraph("What this is", s["h1"]))
    story.append(Paragraph(
        "After our 2026-05-14 walkthrough and your follow-up note on "
        "the Service Agreement, we've reshaped the engagement into a "
        "phased path. <b>Phase 1</b> (this document) is the standard "
        "$997 + Washington state sales tax website + SEO foundation, "
        "set up directly on TEKKY's Shopify store. <b>Phase 2</b> — the "
        "full $10,000 AI Marketing System — remains on the table whenever "
        "your inbound flow + club deal-flow tells you it's time, at the "
        "same scope we already discussed.",
        s["body"],
    ))
    story.append(Paragraph(
        "This packet covers exactly what Phase 1 delivers, what we need "
        "from you to start the build, the pricing breakdown, and the "
        "signature block at the back.",
        s["body"],
    ))

    # Phase 1 scope
    story.append(Paragraph("What Phase 1 delivers", s["h1"]))

    scope_data = [
        [
            Paragraph("<b>Deliverable</b>", s["body_head"]),
            Paragraph("<b>What's included</b>", s["body_head"]),
        ],
        [
            Paragraph("Bespoke TEKKY website", s["body_cell"]),
            Paragraph(
                "The custom design we've already aligned on — not a "
                "template. Honored at the standard-tier price as a "
                "one-time exception given the work already completed.",
                s["body_cell"],
            ),
        ],
        [
            Paragraph("Shopify store integration", s["body_cell"]),
            Paragraph(
                "Site set up directly on TEKKY's Shopify store so you "
                "have the polished website + native commerce stack you "
                "were initially seeking. Product pages, cart, and "
                "checkout stay native to Shopify; the BlueJays site is "
                "the marketing front + SEO layer that funnels traffic "
                "into it.",
                s["body_cell"],
            ),
        ],
        [
            Paragraph("SEO foundation", s["body_cell"]),
            Paragraph(
                "JSON-LD structured data, llms.txt (AI-crawler discovery "
                "for ChatGPT, Claude, Perplexity, Gemini, Bing AI), "
                "Open Graph + Twitter meta tags, XML sitemap, robots.txt. "
                "The long-tail SEO engine that most agencies bill as a "
                "separate ~$1.5K/mo line item — included as the foundation.",
                s["body_cell"],
            ),
        ],
        [
            Paragraph("Contact capture", s["body_cell"]),
            Paragraph(
                "Contact form on the site routing inquiries directly "
                "to your inbox. Optional Twilio SMS alert on every new "
                "lead can be wired up — let us know in the sign-off form.",
                s["body_cell"],
            ),
        ],
        [
            Paragraph("Hosting + maintenance (year 1)", s["body_cell"]),
            Paragraph(
                "Hosting on Vercel, ongoing maintenance, and standard "
                "content updates included for the first year. After "
                "year 1, the $100/yr standard renewal keeps the site "
                "live + maintained.",
                s["body_cell"],
            ),
        ],
    ]

    scope_table = Table(scope_data, colWidths=[1.6 * inch, 4.6 * inch])
    scope_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), TEKKY_NAVY),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, SOFT_BG]),
        ("GRID", (0, 0), (-1, -1), 0.25, HexColor("#cbd5e1")),
    ]))
    story.append(scope_table)

    # What's NOT included
    story.append(Paragraph("What Phase 1 does NOT include", s["h1"]))
    story.append(Paragraph(
        "These items are part of <b>Phase 2 — the $10,000 AI Marketing "
        "System</b>. They stay off-scope for Phase 1 so the budget "
        "supports your grassroots ad spend instead. When you activate "
        "Phase 2, they all turn on at the originally-discussed scope:",
        s["body"],
    ))
    not_included = [
        "Per-audience funnel engine (parent / coach / player / club tracks)",
        "AI inbound responder (drafts replies in your voice)",
        "Hyperloop A/B (auto-optimizes ad headlines + email subjects)",
        "Custom ad creative library (Meta Feed/Reels/Stories + Google Search/PMax/YouTube)",
        "Affiliate / club partner program with commission tracking",
        "Weekly Monday digest of leads + spend + conversion",
        "Owner portal cockpit with Cmd-K search + bulk-action toolbar",
        "Lead magnet generation + multi-platform distribution",
    ]
    for item in not_included:
        story.append(Paragraph(f"• {item}", s["bullet"]))

    story.append(PageBreak())

    # Pricing
    story.append(Paragraph("Pricing breakdown", s["h1"]))

    price_data = [
        [
            Paragraph("<b>Item</b>", s["body_head"]),
            Paragraph("<b>Amount</b>", s["body_head"]),
        ],
        [Paragraph("Phase 1 base — site + SEO + Shopify integration", s["body_cell"]),
         Paragraph("<b>$997.00</b>", s["body_cell"])],
        [Paragraph("Washington state sales tax (applied at checkout)", s["body_cell"]),
         Paragraph("calculated by Stripe", s["body_cell"])],
        [Paragraph("Year-1 hosting + maintenance + updates", s["body_cell"]),
         Paragraph("<b>included</b>", s["body_cell"])],
        [Paragraph("Year-2+ standard renewal (per year)", s["body_cell"]),
         Paragraph("$100.00", s["body_cell"])],
    ]
    price_table = Table(price_data, colWidths=[4.6 * inch, 1.6 * inch])
    price_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), TEKKY_NAVY),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, SOFT_BG]),
        ("GRID", (0, 0), (-1, -1), 0.25, HexColor("#cbd5e1")),
        ("ALIGN", (1, 0), (1, -1), "RIGHT"),
    ]))
    story.append(price_table)

    story.append(Paragraph(
        "<b>Payment:</b> one-time charge at signing. Stripe Payment Link "
        "calculates and adds Washington state sales tax at checkout. "
        "Build work starts the business day funds clear. No installment "
        "plan on the standard tier.",
        s["quote_amber"],
    ))

    # Timeline
    story.append(Paragraph("Timeline", s["h1"]))
    timeline_data = [
        [Paragraph("<b>Milestone</b>", s["body_head"]),
         Paragraph("<b>What happens</b>", s["body_head"])],
        [Paragraph("Day 0 — payment", s["body_cell"]),
         Paragraph("Stripe charge clears. Build work begins same business day.", s["body_cell"])],
        [Paragraph("Day 1-3", s["body_cell"]),
         Paragraph("Shopify access wired up. Final brand assets locked. Site copy reviewed for tone.", s["body_cell"])],
        [Paragraph("Day 3-7", s["body_cell"]),
         Paragraph("Site built + SEO foundation deployed. Internal QA pass on desktop + mobile.", s["body_cell"])],
        [Paragraph("Day 7-10", s["body_cell"]),
         Paragraph("Staging link sent to you for review. One revision round included in Phase 1 scope.", s["body_cell"])],
        [Paragraph("Day 10-14", s["body_cell"]),
         Paragraph("Final revisions applied. Site goes live on tekky.org. Search Console + analytics confirmed.", s["body_cell"])],
    ]
    timeline_table = Table(timeline_data, colWidths=[1.6 * inch, 4.6 * inch])
    timeline_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), TEKKY_NAVY),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, SOFT_BG]),
        ("GRID", (0, 0), (-1, -1), 0.25, HexColor("#cbd5e1")),
    ]))
    story.append(timeline_table)

    # What we need
    story.append(Paragraph("What we need from you", s["h1"]))
    needs = [
        ("Shopify admin access",
         "Best path is inviting ben@bluejayportfolio.com as a Staff account on your Shopify admin. Alternative: a screenshare during setup. Either works — confirm preference in the sign-off form."),
        ("Final brand assets",
         "Highest-resolution logo you have, brand colors (hex codes), and any photography you want featured on the site. If something needs sourcing, we'll handle it from stock libraries with your sign-off."),
        ("Contact form destination",
         "Email address where leads from the contact form should land. Optional SMS-on-new-lead can also be wired up via Twilio — just let us know your cell + whether you want it on."),
        ("Owner cell phone",
         "Used for any urgent owner alerts (site issues, lead spikes, payment events). Never used for marketing."),
        ("Preferred launch window",
         "How fast you want Phase 1 live — ASAP, within two weeks, or a target date. The 7-14 day timeline above is typical; we can compress for ASAP if Shopify access + brand assets land on Day 1."),
    ]
    for label, detail in needs:
        block = KeepTogether([
            Paragraph(label, s["h2"]),
            Paragraph(detail, s["body"]),
        ])
        story.append(block)

    story.append(PageBreak())

    # Phase 2 path
    story.append(Paragraph("The path to Phase 2 (whenever you're ready)", s["h1"]))
    story.append(Paragraph(
        "Phase 1 puts TEKKY on a polished, SEO-foundation-baked site "
        "that supports your grassroots ad spend. The AI Marketing System "
        "we originally scoped is built to generate inbound flow, not "
        "optimize existing flow — so it makes sense to activate it when "
        "your grassroots motion has produced enough volume + club "
        "relationships that the system has real data to work with.",
        s["body"],
    ))
    story.append(Paragraph(
        "When that moment arrives, the full $10,000 AI Marketing System "
        "is still on the table at the originally-discussed scope:",
        s["body"],
    ))
    phase2 = [
        "Per-audience funnel engine (parent / coach / player / club)",
        "Custom ad creative library spanning Meta + Google + Lob direct mail",
        "AI inbound responder drafting in your voice",
        "Hyperloop A/B auto-optimization on ads + emails",
        "Affiliate / club partner program with commission tracking",
        "Weekly Monday digest of leads, spend, and conversion",
        "Owner portal cockpit",
    ]
    for item in phase2:
        story.append(Paragraph(f"• {item}", s["bullet"]))
    story.append(Paragraph(
        "<b>No re-pricing or re-scoping needed when you activate.</b> "
        "The same offer stands.",
        s["body"],
    ))

    # SLA pointer
    story.append(Paragraph("Working contract", s["h1"]))
    story.append(Paragraph(
        "Separate from this packet, there's a one-page Service-Level "
        "Agreement at "
        "<font color='#1e40af'><b>bluejayportfolio.com/sign/zenith-sports/sla</b></font> "
        "that covers response times for site issues, what's included "
        "in year-1 maintenance, what's out of scope, and the escalation "
        "order when something feels off. Please review + acknowledge it "
        "in the same sitting as this packet.",
        s["body"],
    ))

    # Signature block
    story.append(Paragraph("Acknowledgment", s["h1"]))
    story.append(Paragraph(
        "By signing below (or completing the acknowledgment form at the "
        "sign URL on the cover), Paul + Philip confirm: (a) Phase 1 scope "
        "and pricing as described above; (b) that Phase 1 does not "
        "include the AI Marketing System features listed on page 1; and "
        "(c) that Phase 2 remains available at the originally-discussed "
        "scope whenever activated.",
        s["body"],
    ))
    story.append(Spacer(1, 0.2 * inch))

    # Sig lines table
    sig_data = [
        [Paragraph("Signed name", s["sig_label"]),
         Paragraph("Date", s["sig_label"])],
        [FillLine(width=3.3 * inch), FillLine(width=1.7 * inch)],
        [Paragraph("Role (founder / co-founder)", s["sig_label"]),
         Paragraph("Email on file", s["sig_label"])],
        [FillLine(width=3.3 * inch), FillLine(width=1.7 * inch)],
    ]
    sig_table = Table(sig_data, colWidths=[3.4 * inch, 2.8 * inch])
    sig_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
    ]))
    story.append(sig_table)

    return story


# ─── Entry point ───────────────────────────────────────────────────────
def main():
    out = Path("public/clients/zenith-sports/pdfs/tekky-onboarding-handoff.pdf")
    out.parent.mkdir(parents=True, exist_ok=True)

    doc = SimpleDocTemplate(
        str(out),
        pagesize=LETTER,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.85 * inch,
        bottomMargin=0.75 * inch,
        title="TEKKY · Phase 1 Welcome Packet",
        author="BlueJays",
    )
    styles = build_styles()
    doc.build(build_story(styles), onFirstPage=_header_footer, onLaterPages=_header_footer)
    print(f"Wrote {out} ({out.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
