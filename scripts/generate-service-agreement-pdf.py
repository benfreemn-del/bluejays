"""
Generate BlueJays AI Marketing System Service Agreement PDF.

Output: bluejays/public/onboarding/bluejays-service-agreement.pdf — shared
across every AI System ($10k tier) client. Web-accessible at
https://bluejayportfolio.com/onboarding/bluejays-service-agreement.pdf
and from local dev at http://localhost:PORT/onboarding/bluejays-service-agreement.pdf

Registered in src/lib/onboard-docs.ts for each AI System slug so the
client receives /sign/[slug]/agreement and gets the same contract.

The content here MIRRORS src/lib/service-agreement.ts (the "agency" plan
variant). When the TS version is bumped, bump VERSION + EFFECTIVE_DATE
here too and re-run this script.

Re-run from repo root:
    py scripts/generate-service-agreement-pdf.py
"""

from __future__ import annotations

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
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
)


# Must match src/lib/service-agreement.ts constants
VERSION = "1.2.0"
EFFECTIVE_DATE = "2026-05-18"


# Color palette (matches SLA generator)
NAVY = colors.HexColor("#0a0f1e")
INK = colors.HexColor("#0f172a")
SLATE = colors.HexColor("#475569")
SKY = colors.HexColor("#0ea5e9")
WHITE = colors.white


ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "onboarding"
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT_FILE = OUT_DIR / "bluejays-service-agreement.pdf"


styles = getSampleStyleSheet()

TITLE = ParagraphStyle(
    "Title", parent=styles["Title"],
    fontSize=24, leading=28, textColor=INK, alignment=TA_LEFT,
    fontName="Helvetica-Bold", spaceAfter=4,
)
SUBTITLE = ParagraphStyle(
    "Subtitle", parent=styles["Normal"],
    fontSize=10, leading=14, textColor=SLATE, alignment=TA_LEFT,
    spaceAfter=12,
)
H2 = ParagraphStyle(
    "H2", parent=styles["Heading2"],
    fontSize=13, leading=17, textColor=INK,
    fontName="Helvetica-Bold", spaceBefore=14, spaceAfter=6,
)
BODY = ParagraphStyle(
    "Body", parent=styles["Normal"],
    fontSize=10, leading=14, textColor=INK,
    spaceAfter=6,
)
SMALL = ParagraphStyle(
    "Small", parent=styles["Normal"],
    fontSize=9, leading=12, textColor=SLATE,
    spaceAfter=4,
)


# ── FillLine flowable (same pattern as SLA generator) ──
_FIELD_SEQ = [0]


def _next_field_name(prefix: str) -> str:
    _FIELD_SEQ[0] += 1
    return f"{prefix}_{_FIELD_SEQ[0]}"


class FillLine(Flowable):
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
                x=abs_x, y=abs_y,
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


# ── Agreement content (mirrors src/lib/service-agreement.ts agency variant) ──

SECTIONS = [
    (
        "1. Parties",
        [
            "This Service Agreement (the “Agreement”) is between BlueJay Business Solutions LLC, a Washington State limited liability company located in Quilcene, Washington (“Provider,” “BlueJays,” “we,” “us,” or “our”), and the individual or business identified during onboarding (the “Client,” “you,” or “your”).",
            "By checking the acceptance box on the sign page (or signing below), you (a) confirm that you have authority to bind the Client to this Agreement, (b) confirm that you have read this Agreement in full, and (c) agree to be bound by its terms.",
        ],
    ),
    (
        "2. Services & Deliverables",
        [
            "Provider will design, build, and deploy a self-learning AI Marketing System (the “System”) custom for Client’s business. The System is a single connected funnel that includes:",
            "• Custom website (designed for Client’s industry, mobile-first, conversion-tracked)",
            "• Google Ads — full account setup, structure, and first thirty (30) days of active management",
            "• Meta Ads (Facebook + Instagram) — full setup and first thirty (30) days of active management",
            "• Email automation — sequences, re-engagement flows, weekly newsletter setup, and integration with the website",
            "• SMS automation — replies, reminders, and drip flows via Twilio",
            "• Voicemail-drop capability — broadcast voicemails to opted-in prospect lists via a Client-supplied or Provider-supplied compliant vendor",
            "• SEO foundation — schema markup, sitemap, on-page optimization, llms.txt for AI crawlers, and Google Business Profile optimization",
            "• Custom AI lead magnet — an industry-specific audit, quiz, calculator, or asset designed to feed the top of the funnel",
            "• Brand polish across the System",
            "• AI auto-responder + AI Operator skills (Lead Reply Drafter, Audience Detector, Customer Save Agent, etc.) — handle inbound replies and routine outbound drafting within configured guardrails",
            "• Owner Portal — leads tab, ads library, weekly auto-reports, partner/affiliate roster, AI Operator preview",
            "• Monthly performance reports during install window",
            "Provider will deliver a working System within thirty (30) days of receiving Client’s completed onboarding (the “Onboarding Submission”). “Working” means each component above is wired, sending live traffic and capturing live leads, even if optimization is ongoing.",
            "Excluded unless purchased separately: paid ad spend (see Section 4), AI vendor usage charges (Claude / OpenAI billing — see Section 4), translation services, custom CRM development beyond the standard integration, video production, professional voice-over, and bespoke direct-mail campaigns.",
        ],
    ),
    (
        "3. Pricing & Payment",
        [
            "Plan: AI Marketing System (Agency).",
            "Total Project Fee: <b>$10,000 USD total</b> — paid as four (4) quarterly installments of $2,500 OR $9,700 paid in full at signing (a $300 pay-in-full discount).",
            "Payment Schedule: Two options. (a) <b>$9,700 paid in full</b> upon acceptance of this Agreement; OR (b) <b>four (4) quarterly installments of $2,500</b> ($10,000 total) — the first installment is the launch payment due upon acceptance; subsequent installments charged automatically every 90 days via a Stripe subscription that auto-cancels after the 4th payment.",
            "<b>Optional ongoing managed-operations retainer ($500/mo):</b> Available on request (not promoted publicly) after the 30-day install window. Covers continued weekly ad iteration, sequence optimization, AI tuning, weekly reporting, and Provider’s direct availability. Billed monthly via Stripe Subscriptions. Cancellable any time with thirty (30) days’ written notice. Absent the retainer, Provider remains available for as-needed updates and fixes per the response-time commitments in the companion Service-Level Agreement (SLA).",
            "Payments are processed via Stripe. Failed payments will be retried per Stripe’s standard dunning schedule. Repeated failure may result in suspension of services until current.",
            "All fees are stated in U.S. Dollars and are exclusive of any applicable taxes, which Client is responsible for. Provider remits Washington State Business &amp; Occupation tax (B&amp;O, 1.5%) directly to the state out of the Project Fee — no extra charge to Client.",
        ],
    ),
    (
        "4. Ad Spend, AI Usage, &amp; Third-Party Costs",
        [
            "Ad spend is a separate cost paid by Client directly to the relevant ad platform (Google, Meta, etc.) and is NOT included in the Project Fee or the optional retainer. Provider will recommend a starting ad budget during onboarding (typically $750–$3,000/month combined across platforms) but Client controls the budget at all times.",
            "AI vendor usage (Claude, OpenAI, or equivalent) powering the AI Operator and AI Reply Drafter features is billed by the vendor directly to Client on Client’s payment method. Provider does not gate or mark up these charges. Typical usage at the System’s default settings is $20–80/month depending on lead volume.",
            "Client is solely responsible for: (a) maintaining valid billing methods on each ad platform and AI vendor, (b) covering all ad spend and AI usage invoiced by the vendors, (c) keeping accounts in good standing, and (d) any chargebacks or platform suspensions caused by Client billing issues.",
            "Other third-party costs Client is responsible for include: domain registration (one (1) domain at cost, typically $10–$15/year), SMS messaging fees via Twilio (typically $0.01 per message at scale), email-sending costs above the included threshold (Provider includes 10,000 sends per month; overages billed at SendGrid rates), and any premium tools Client elects to add.",
            "Provider does not mark up ad spend, AI vendor usage, domain fees, or messaging costs. Client pays vendors at cost.",
        ],
    ),
    (
        "5. Onboarding &amp; Timeline",
        [
            "Provider commits to delivering a live, functioning System within thirty (30) days of receiving Client’s completed Onboarding Submission. The thirty-day clock starts when the Onboarding Submission is complete; if Client provides only partial information, the clock starts when the missing required fields are supplied.",
            "Required onboarding fields include: business name, primary contact, ICP definition (industry, geography, buyer title, deal size), brand assets (logo, colors, voice), legal disclosures Client requires on ads, list of services + pricing, current website (if any), competitor list, and access credentials for any existing ad/email/CRM accounts Client wants to keep.",
            "Provider is not responsible for delays caused by Client’s failure to provide required onboarding information, sign required platform access invitations, or approve initial ad creative.",
        ],
    ),
    (
        "6. Revisions &amp; Iteration",
        [
            "Provider continuously iterates on the System during the 30-day install window. Iteration is data-driven (winners scaled, losers cut) and does not require Client approval for routine optimization.",
            "Material changes — new lead magnets, repositioning of the offer, significant brand changes, addition of new ad platforms — require Client written approval before implementation.",
            "Free Client-requested revisions during the install window: unlimited copy and headline revisions, unlimited audience-targeting tweaks, unlimited sequence iteration, and up to three (3) major creative redesigns. Beyond three major creative redesigns within the 30-day window, Provider may charge for additional design hours at a rate quoted in advance.",
        ],
    ),
    (
        "7. Refunds &amp; Termination",
        [
            "<b>Pre-go-live refund:</b> Client may request a full refund at any time prior to the System’s go-live date if, in Client’s reasonable judgment, the System under construction does not meet the standard of work represented by Provider in Provider’s public marketing materials. Refund requests must be submitted in writing (email to bluejaycontactme@gmail.com) prior to go-live. Upon refund, Client will receive 100% of fees paid to date, less any third-party fees (domain, ad spend, AI vendor usage, etc.) already paid by Provider on Client’s behalf and not reimbursed by the relevant vendor.",
            "<b>Post-go-live:</b> Refunds are not available after the System has gone live. Client’s remedy for dissatisfaction is the revision and iteration process in Section 6 + the response-time commitments in the SLA.",
            "<b>Termination for cause:</b> Either party may terminate this Agreement for material breach by the other party if the breach remains uncured for fourteen (14) days after written notice.",
            "<b>Termination by Client without cause after go-live:</b> Client may terminate at any time. Termination ends Provider’s ongoing obligations but does NOT terminate Client’s ownership of the System per Section 9. Already-collected installment payments are non-refundable; any future scheduled installments are cancelled.",
            "<b>Effect of termination:</b> (a) Client remains responsible for any fees accrued prior to termination, (b) Provider’s confidentiality obligations survive, (c) the IP license granted to Client in Section 9 remains in effect for any work product for which full payment was made, and (d) Provider will, on written request, hand over administrative ownership of all accounts (ad platforms, email, SMS, domain, hosting) within seven (7) business days.",
        ],
    ),
    (
        "8. Client Responsibilities",
        [
            "Client agrees to:",
            "• Provide accurate, current, and complete information during onboarding, including ICP definition and access credentials",
            "• Maintain valid billing methods on Google Ads, Meta, Twilio, SendGrid, Claude/OpenAI, and any other third-party platforms required by the System",
            "• Cover all ad spend, AI usage, and third-party costs as described in Section 4",
            "• Respond to qualified leads within forty-eight (48) hours of receipt so Provider can iterate on real conversion data",
            "• Provide content, photos, and brand assets that Client owns or has the legal right to use, and indemnify Provider against any claim that Client-provided content infringes third-party rights",
            "• Comply with all applicable laws governing email (CAN-SPAM), SMS (TCPA, A2P 10DLC registration), telephony (TCPA), and advertising (FTC, platform-specific rules). Provider will set up infrastructure for compliance, but Client is the sender of record and bears ultimate responsibility for the content sent",
            "• Not use the System for unlawful purposes, including but not limited to fraud, defamation, copyright infringement, or content that violates U.S. or Washington State law",
            "• Maintain payment in good standing per the schedule in Section 3",
        ],
    ),
    (
        "9. Data Ownership, IP &amp; System Continuity",
        [
            "<b>Data ownership:</b> Lead lists, customer data, ad performance metrics, brand-voice configuration, funnel content, voicemail recordings, weekly reports, and all data generated under Client’s slug are owned by Client. Provider operates this data on Client’s behalf during the engagement but never claims ownership.",
            "<b>Export anytime:</b> Standard CSV export from the Owner Portal Leads tab is one click. Full-database exports across every table tied to Client’s slug are available on request — 1 business day turnaround, no fee while Client is an active engagement, $250 one-time fee for ex-clients.",
            "<b>IP transfer:</b> Upon receipt of full payment of the Project Fee, Provider transfers to Client a perpetual, irrevocable, worldwide, royalty-free license to use, modify, and continue running the System’s final delivered components in connection with Client’s business. This includes: the website code and design, the ad account structures and campaigns, the email and SMS sequences, the AI auto-responder configuration, the lead magnet, and the brand assets created for the System.",
            "<b>Account ownership:</b> Third-party accounts (Google Ads, Meta Business Manager, Twilio, SendGrid, domain registrar, hosting, Claude/OpenAI) are owned by Client at all times during the engagement. Provider operates them as a contractor.",
            "<b>What continues after the 4-installment program ends:</b> The system is yours — site, portal, funnel definitions, ad library, brand-voice config, and lead data stay live under Client’s account. AI replies continue automatically because Client pays the underlying AI vendor (Claude/OpenAI) directly on Client’s card — Provider doesn’t gate that. Provider steps back from scheduled cadence to as-needed support: available for updates, fixes, and questions on the same SLA response times, but no longer actively iterating on optimization unless the optional $500/mo retainer (Section 3) is elected.",
            "<b>Provider retains:</b> (a) Provider’s underlying methodologies, V2 framework code, internal scripts, AI prompts, and proprietary playbooks (these power the System but do not transfer to Client as an operating manual), and (b) the right to use anonymized, aggregated performance data from the System to improve Provider’s products and services across other clients.",
            "Provider may feature the engagement, results, screenshots, and a link to Client’s System in Provider’s portfolio, case studies, marketing materials, and ad creatives. Client may opt out of public portfolio inclusion by written request before go-live.",
        ],
    ),
    (
        "10. Confidentiality",
        [
            "Both parties agree to keep confidential any non-public information shared during the engagement, including pricing details, business strategies, customer lists, performance data, and proprietary content. This obligation survives termination of the Agreement.",
            "Confidentiality does not apply to information that is (a) publicly known through no fault of the receiving party, (b) independently developed without use of the other party’s confidential information, or (c) required to be disclosed by law.",
        ],
    ),
    (
        "11. Limitation of Liability",
        [
            "TO THE MAXIMUM EXTENT PERMITTED BY LAW, PROVIDER’S TOTAL LIABILITY UNDER OR RELATING TO THIS AGREEMENT SHALL NOT EXCEED THE TOTAL PROJECT FEE PAID BY CLIENT TO PROVIDER IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM (NOT INCLUDING AD SPEND, AI VENDOR USAGE, OR THIRD-PARTY COSTS, WHICH ARE PAID DIRECTLY TO VENDORS).",
            "PROVIDER SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOST PROFITS, LOST REVENUE, LOST DATA, BUSINESS INTERRUPTION, OR AD ACCOUNT SUSPENSIONS BY THIRD-PARTY PLATFORMS, EVEN IF PROVIDER HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.",
            "Provider makes no warranty regarding revenue, profit, return on ad spend (ROAS), or Client’s close rate. Provider warrants only that the System will be delivered substantially as represented and will function as a working marketing system.",
        ],
    ),
    (
        "12. Indemnification",
        [
            "Client shall indemnify, defend, and hold harmless Provider, its members, employees, and affiliates from and against any claims, damages, losses, or expenses (including reasonable attorneys’ fees) arising out of or related to: (a) content, photos, copy, or claims provided or approved by Client; (b) Client’s use of the System after delivery; (c) Client’s violation of any law (including TCPA, CAN-SPAM, or platform terms of service) or third-party right; or (d) any breach of this Agreement by Client.",
        ],
    ),
    (
        "13. Force Majeure",
        [
            "Neither party shall be liable for any delay or failure to perform caused by events beyond their reasonable control, including but not limited to natural disasters, acts of God, pandemics, war, terrorism, civil unrest, government action, internet or hosting provider outages, ad-platform suspensions or policy changes outside Provider’s control, or labor disputes. The affected party shall notify the other promptly and resume performance as soon as reasonably practicable.",
        ],
    ),
    (
        "14. Governing Law &amp; Dispute Resolution",
        [
            "This Agreement is governed by the laws of the State of Washington, without regard to its conflict-of-laws principles.",
            "Any dispute arising out of or relating to this Agreement shall first be subject to good-faith mediation between the parties. If mediation fails to resolve the dispute within thirty (30) days, the dispute shall be resolved by binding arbitration administered by the American Arbitration Association (AAA) in Jefferson County, Washington, under its Commercial Arbitration Rules. Judgment on the arbitrator’s award may be entered in any court of competent jurisdiction.",
            "Each party shall bear its own costs of mediation and arbitration unless the arbitrator awards costs to the prevailing party.",
            "Notwithstanding the foregoing, either party may seek injunctive relief in any court of competent jurisdiction for breach of confidentiality or intellectual property rights.",
        ],
    ),
    (
        "15. General Provisions",
        [
            "<b>Entire Agreement:</b> This Agreement (together with the companion Service-Level Agreement) constitutes the entire agreement between the parties regarding the Services and supersedes all prior negotiations, communications, or agreements.",
            "<b>Amendments:</b> This Agreement may only be modified in writing signed (or click-accepted via a re-issued sign page) by both parties.",
            "<b>Severability:</b> If any provision is held invalid or unenforceable, the remaining provisions shall continue in full force and effect.",
            "<b>No Waiver:</b> Failure by either party to enforce any provision shall not constitute a waiver of that provision or any other provision.",
            "<b>Assignment:</b> Neither party may assign this Agreement without the other’s written consent, except that Provider may assign to a successor entity in the event of a merger, acquisition, or sale of substantially all of its assets.",
            "<b>Notices:</b> Notices shall be sent by email to bluejaycontactme@gmail.com (for Provider) or to the email address provided by Client during onboarding.",
            "<b>Counterparts:</b> This Agreement may be accepted electronically. An electronic acceptance via the sign page constitutes a binding signature under the U.S. Electronic Signatures in Global and National Commerce Act (E-SIGN) and applicable Washington State law.",
        ],
    ),
]


def signature_block():
    """Stacked fillable fields — same pattern as the SLA."""
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
        title="BlueJays Service Agreement",
        author="BlueJays Business Solutions LLC",
    )
    frame = Frame(
        doc.leftMargin, doc.bottomMargin,
        doc.width, doc.height,
        id="main", showBoundary=0,
    )
    doc.addPageTemplates([PageTemplate(id="default", frames=[frame])])

    story = []
    story.append(Paragraph("Service Agreement", TITLE))
    story.append(Paragraph(
        f"AI Marketing System (Agency Plan) &middot; Version {VERSION} &middot; "
        f"Effective {EFFECTIVE_DATE} &middot; BlueJay Business Solutions LLC",
        SUBTITLE,
    ))
    story.append(HRFlowable(width="100%", thickness=1, color=SKY))
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "This is the formal contract for the AI Marketing System ($10,000 "
        "agency plan). It works alongside the Service-Level Agreement "
        "(SLA), which spells out response times and what's included on a "
        "day-to-day basis. Read this once, acknowledge below or via the "
        "online sign page, and keep it for your records.",
        BODY,
    ))

    for heading, paragraphs in SECTIONS:
        story.append(Paragraph(heading, H2))
        for p in paragraphs:
            story.append(Paragraph(p, BODY))

    # ── Acceptance + signature block ──
    story.append(Paragraph("16. Acceptance", H2))
    story.append(Paragraph(
        f"By checking the acceptance box on the digital sign page at "
        f"<font color='#0ea5e9'>bluejayportfolio.com/sign/[your-slug]/agreement</font> "
        f"(or signing below), Client accepts this Agreement (Version "
        f"{VERSION}, effective {EFFECTIVE_DATE}, AI Marketing System / "
        f"Agency variant) and becomes legally bound by its terms.",
        BODY,
    ))
    story.append(Paragraph(
        "A copy of this Agreement is available at "
        "<font color='#0ea5e9'>bluejayportfolio.com/onboarding/bluejays-service-agreement.pdf</font> "
        "at any time, and a record of acceptance (signer name, optional "
        "email, timestamp, and IP-hash) is retained by Provider.",
        BODY,
    ))
    story.append(Spacer(1, 24))
    for el in signature_block():
        story.append(el)

    story.append(Spacer(1, 24))
    story.append(HRFlowable(width="100%", thickness=0.6, color=SLATE))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "BlueJay Business Solutions LLC &middot; bluejaycontactme@gmail.com &middot; "
        "bluejayportfolio.com",
        SMALL,
    ))
    story.append(Paragraph(
        f"Document version: {VERSION} &middot; effective {EFFECTIVE_DATE} &middot; "
        "mirrors src/lib/service-agreement.ts (agency variant)",
        SMALL,
    ))

    doc.build(story)
    print(f"Wrote {OUT_FILE}")


if __name__ == "__main__":
    build()
