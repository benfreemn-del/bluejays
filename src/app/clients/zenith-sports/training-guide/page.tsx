/* eslint-disable @next/next/no-img-element -- single-page printable guide; native img keeps print-stylesheet behavior simple */

/**
 * /clients/zenith-sports/training-guide
 *
 * The TEKKY® Coaching Guide. Lead-magnet PDF for coaches/DOCs who submit
 * the "Get the TEKKY® coaching guide" email-capture on the showcase page.
 *
 * Sourced from:
 *   - The 26-drill video library (training-drills.tsx) — same content as
 *     the public training section, but presented as a printable curriculum
 *     instead of a YouTube grid.
 *   - The TEKKY Unified Brand Voice Guide (Section 6 Copy Vault +
 *     Section 2 European-style methodology).
 *   - A 4-week starter session plan (built from the brand voice doc's
 *     "5-post growth system" weekly rhythm, adapted from social to
 *     on-field practice cadence).
 *
 * Design notes:
 *   - Single page, printable. Looks like a real coaching guide on screen,
 *     prints clean as a PDF when you hit Cmd/Ctrl+P → Save as PDF.
 *   - @page CSS sets letter-size with 0.5in margins, hides the print
 *     button + the floating "back" link.
 *   - No client components — pure server render. Loads in <1s.
 *   - Why HTML page and not a real PDF: a hosted page is more accessible
 *     (no download barrier), trackable (we can wire engagement analytics
 *     later), and updateable (edit the file, redeploy, every coach who
 *     re-opens the link sees the latest). Coaches who want a PDF can
 *     print-to-PDF in two clicks.
 */

import Link from "next/link";
import PrintButton from "./print-button";

/* ────────────────────────── DRILL LIBRARY ──────────────────────────
 * NOTE: this array is duplicated in src/data/zenith-drills.ts which
 * powers the Drill of the Week email broadcast. Keep them in sync
 * when adding a new drill — TODO: unify once the page is converted
 * to render from the shared data file.
 */

type CurriculumDrill = {
  id: string; // YouTube id
  name: string;
  why: string;
  cue: string;
};

type CurriculumTier = {
  label: string;
  ageRange: string;
  intro: string;
  drills: CurriculumDrill[];
};

const TIERS: CurriculumTier[] = [
  {
    label: "Warm Up",
    ageRange: "All ages · 8–12 min",
    intro:
      "Wake up the ankle, the hip, the eye-on-ball. Every session opens here. The TEKKY's smaller surface means warm-up reps actively re-train the foot — not just heart-rate work.",
    drills: [
      {
        id: "bX-HMzizdxU",
        name: "Instep Touch",
        why: "Re-tunes the laces-to-ball relationship after time off. Smaller surface forces the player to find the sweet spot every rep.",
        cue: "Soft knee. Eyes down then up.",
      },
      {
        id: "Wzlr9RpBNs4",
        name: "Outside-Foot Gather, Instep Pass",
        why: "First-touch redirection. The combo of trap + change-of-direction + pass in one motion is the bedrock of possession soccer.",
        cue: "Outside catches — laces release.",
      },
      {
        id: "g28gQ2aZ-0k",
        name: "1 Touch Instep Pass",
        why: "No second chance. Forces composure under low pressure so high-pressure reps later are familiar.",
        cue: "One-time. Plant foot pointed.",
      },
      {
        id: "mukre9VRGx4",
        name: "1 Touch Outside Foot Pass",
        why: "Develops the under-used outside-of-foot pass. Small surface area amplifies the technique demand.",
        cue: "Toe down, ankle locked.",
      },
      {
        id: "qXGWT_-_yF4",
        name: "Laces Gather and Pass",
        why: "Cushion + redirect with the laces. Builds the soft first-touch parents always say is missing in U.S. youth soccer.",
        cue: "Cushion — don't kill it.",
      },
      {
        id: "nyGSAw-4Xw0",
        name: "1 Touch Laces",
        why: "The hardest of the 1-touch series. Composure on the half-volley. Trains the player to read trajectory before the ball arrives.",
        cue: "See it early. Strike through.",
      },
      {
        id: "68vbXVsSKes",
        name: "Instep Trap, Outside Touch, Instep Pass",
        why: "Sequential change-of-foot reps. Builds the muscle memory of using both surfaces in the same possession.",
        cue: "In, out, in — flow.",
      },
      {
        id: "G8aa_34JpFg",
        name: "Sole Trap, Instep Pass",
        why: "Sole control + redirect. The sole-of-foot is the unsung hero of close control under pressure.",
        cue: "Sole stops, laces sends.",
      },
      {
        id: "rab0LPa33VI",
        name: "Sole Trap, Outside Foot Pass",
        why: "Trains the deceptive outside-foot pass off a stop. Useful in tight wing channels.",
        cue: "Disguise the line.",
      },
      {
        id: "hWQGlKbx0HM",
        name: "Sole Trap, Cross Body Drag, Instep Pass",
        why: "Three-touch combination. Closer to a real game movement. The drag fakes a defender, the pass exits the line they were defending.",
        cue: "Drag late. Pass committed.",
      },
    ],
  },
  {
    label: "Beginner",
    ageRange: "U8–U12 · 15–20 min after warm-up",
    intro:
      "The first shapes of close control. Players get reps on the basic ball-mastery moves used by every European academy in the first 10 years of a player's life. We focus on cleanness here — speed comes later.",
    drills: [
      {
        id: "l40Cq1RJ_QI",
        name: "La Croqueta",
        why: "Iniesta's signature. Shifts the ball laterally between feet under pressure. The smaller surface forces precision on the first touch — no slop.",
        cue: "Inside — inside. Push through.",
      },
      {
        id: "074-lKwl9kI",
        name: "La Croqueta + 2-Touch Shift",
        why: "Builds repetition. The player has to chain the croqueta into a shift so it becomes a habit, not a party trick.",
        cue: "Repeat the rhythm.",
      },
      {
        id: "n4625BwqiU0",
        name: "Push Pull",
        why: "Sole-of-foot push, sole-of-foot pull. The fundamental rhythm of every elite player's close control.",
        cue: "Sole stays light.",
      },
      {
        id: "v4bHgBiPW6I",
        name: "Inside · Outside",
        why: "Two-surface control of the same foot. Trains the ankle to switch instantly.",
        cue: "Inside, outside — same foot.",
      },
      {
        id: "Lnny2pLZmiI",
        name: "Sole Drag",
        why: "Decoy + escape. Pulls the ball backward to break a defender's line.",
        cue: "Drag ball INTO body.",
      },
      {
        id: "ojviCQ0mrsY",
        name: "V-Cut",
        why: "Change of direction in one touch. The shape of every cut a winger makes.",
        cue: "V — short, sharp, gone.",
      },
      {
        id: "nPzYPHHwgGU",
        name: "L-Drag",
        why: "Combines the sole drag with a change of direction. Creates the L shape that breaks parallel-line defending.",
        cue: "Drag, then 90-degrees out.",
      },
      {
        id: "2h1hwvVDTXI",
        name: "Inside · Outside Combo",
        why: "Adds a second touch to inside/outside. Builds the rhythm needed for sequencing under pressure.",
        cue: "Two touches, one purpose.",
      },
      {
        id: "Kaj6ymLWsB8",
        name: "Scissors · Outside Push",
        why: "Body-feint into outside-foot exit. Trains deception + acceleration in the same rep.",
        cue: "Sell the scissor. Mean the push.",
      },
      {
        id: "6mCwL9xHfLk",
        name: "Double Scissors · Outside Push",
        why: "Two scissors before the exit. Players who own this can beat any U10 defender in a 1v1.",
        cue: "Scissor, scissor, GO.",
      },
    ],
  },
  {
    label: "Intermediate",
    ageRange: "U12+ · 20–25 min after Beginner reps",
    intro:
      "Layered combinations. Each move stacks on a Beginner-tier pattern. By the time a player can run these clean on the TEKKY, they own the regulation ball.",
    drills: [
      {
        id: "aLWVJfbAn9I",
        name: "Tap Tap Drag · La Croqueta · Drag",
        why: "Six-touch combo. Builds the kind of close-quarter solving that turns U13 academy players into U15 first-team prospects.",
        cue: "Tap tap. Drag. Croquet. Drag.",
      },
      {
        id: "2mqCyIdrlBs",
        name: "Push Pull U-Drag with Cone",
        why: "Adds a real obstacle. The cone forces the player to commit to spacing — no fudging.",
        cue: "Stay tight to the cone.",
      },
      {
        id: "p7k4AF7piT4",
        name: "L-Drag Roll",
        why: "Sole-roll through the L. Develops the rolling-sole control that's the hardest skill to coach.",
        cue: "Roll. Don't kick.",
      },
      {
        id: "9frnJdNJW9o",
        name: "Roll · Stepover [The Jay Jay]",
        why: "Stepover off a roll. Pure deception under tight space.",
        cue: "Roll first, sell the stepover.",
      },
      {
        id: "ldiRz5W-Mjo",
        name: "Single-Leg V-Cut to L-Drag",
        why: "One-foot patterning. Forces both feet to work independently — a hallmark of two-footed pros.",
        cue: "Same foot. Don't switch.",
      },
      {
        id: "fydguVA6Fzw",
        name: "Touch In · Scissors · Touch Out",
        why: "Three-touch deception sequence. Closest move in the library to a real-game 1v1.",
        cue: "In, scissor, OUT.",
      },
    ],
  },
];

/* ────────────────────── 4-WEEK STARTER PLAN ──────────────────────
 * Adapted from the brand voice doc's weekly content rhythm — translated
 * from social-post cadence to on-field practice cadence. Each week
 * progresses from Warm Up → Beginner → Intermediate combinations,
 * mirroring the way the social side ramps from Skill Posts to
 * Authority Posts.
 */

const WEEKLY_PLAN = [
  {
    week: "Week 1 — Foundation",
    focus: "Touch + control",
    sessions: [
      {
        day: "Mon",
        title: "Warm Up only",
        body: "All 10 warm-up drills. 30 sec each, 2 sets. Focus on cleanness, not speed. End with a 5-min small-sided 3v3 to reset the brain.",
      },
      {
        day: "Wed",
        title: "Warm Up + first 3 Beginner moves",
        body: "Full warm-up. Then La Croqueta · Push Pull · Inside-Outside. 1 min each, 3 sets. Slow.",
      },
      {
        day: "Fri",
        title: "Warm Up + drill of the week",
        body: "Full warm-up. Pick the move every player is struggling with most and run it 5×30 sec with corrections.",
      },
    ],
  },
  {
    week: "Week 2 — Patterning",
    focus: "Sole-of-foot control",
    sessions: [
      {
        day: "Mon",
        title: "Sole-foot focus",
        body: "Warm up via Sole Trap drills only (G8aa_34, rab0LP, hWQGl). Then add Sole Drag + L-Drag from Beginner.",
      },
      {
        day: "Wed",
        title: "V-Cut / L-Drag combos",
        body: "Warm up. Then drill Beginner V-Cut and L-Drag back-to-back — emphasize the change-of-direction beat.",
      },
      {
        day: "Fri",
        title: "Repeat best move from Mon",
        body: "Coach picks the move with most growth potential per player; 8 min focused 1-on-1 reps.",
      },
    ],
  },
  {
    week: "Week 3 — Deception",
    focus: "Sell the move",
    sessions: [
      {
        day: "Mon",
        title: "Scissors series",
        body: "Warm up. Then Scissors · Outside Push and Double Scissors. Coach faces each player and reacts to the feint — give them honest read.",
      },
      {
        day: "Wed",
        title: "Bridge to Intermediate",
        body: "Run Tap Tap Drag · La Croqueta · Drag. Half the players will struggle — pair them with players who got it.",
      },
      {
        day: "Fri",
        title: "1v1 small-area games",
        body: "10x10 yard squares. 1v1 to a line. Whoever can use a learned move successfully = scoring play. Forces transfer to game speed.",
      },
    ],
  },
  {
    week: "Week 4 — Integration",
    focus: "Game-speed transfer",
    sessions: [
      {
        day: "Mon",
        title: "All Intermediate combos",
        body: "Roll · Stepover [The Jay Jay], Push Pull U-Drag, L-Drag Roll. 2 min each, 2 sets. Players will be tired — that's the point.",
      },
      {
        day: "Wed",
        title: "BAE (Before & After) test",
        body: "Run a 5-min possession game on the TEKKY. Then switch to a regulation ball and play 5 more. Ask the players: what felt different? Their answers ARE the marketing.",
      },
      {
        day: "Fri",
        title: "Match-play with curated rules",
        body: "Scrimmage. Goal counts double if the scoring sequence includes a learned move. Reward what you want to see.",
      },
    ],
  },
];

export default function TrainingGuidePage() {
  return (
    <main className="bg-white text-slate-900 print:bg-white">
      {/* Print-specific styles. @page sizes the pdf, @media print hides
          the floating navigation, page-break helpers control how sections
          flow when the user prints. */}
      <style>{`
        @page { size: letter; margin: 0.5in; }
        @media print {
          .no-print { display: none !important; }
          .page-break-before { page-break-before: always; }
          .avoid-break { page-break-inside: avoid; }
          body { font-size: 10.5pt; }
        }
        .serif { font-family: ui-serif, Georgia, Cambria, "Times New Roman", serif; }
      `}</style>

      {/* Top floating bar — hidden on print */}
      <div className="no-print sticky top-0 z-10 bg-[#0a1832] text-white border-b border-white/10">
        <div className="mx-auto max-w-4xl px-5 py-3 flex items-center justify-between">
          <Link
            href="/clients/zenith-sports"
            className="text-xs font-bold tracking-wider uppercase hover:text-[#a3e635]"
          >
            ← Zenith Sports
          </Link>
          <PrintButton />
        </div>
      </div>

      <article className="mx-auto max-w-4xl px-6 sm:px-8 py-10 print:py-0 print:px-0">
        {/* COVER */}
        <header className="mb-12 pb-10 border-b-4 border-[#0a1832] avoid-break">
          <div className="text-[10px] tracking-[0.32em] uppercase font-extrabold text-[#1d4ed8] mb-3">
            Coach + DOC Edition · Patent-Pending
          </div>
          <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter leading-[0.92] text-[#0a1832]">
            The TEKKY<sup className="text-[0.4em] -ml-1 top-[-0.6em]">®</sup>
            <br />
            <span className="text-[#1d4ed8]">Coaching Guide.</span>
          </h1>
          <p className="serif mt-6 text-xl sm:text-2xl text-[#0a1832] italic max-w-2xl leading-relaxed">
            Technique before tactics. The European methodology, brought to
            your driveway, your training pitch, and your roster.
          </p>
          <div className="mt-8 grid sm:grid-cols-3 gap-3 text-sm">
            {[
              { k: "26", v: "Drills across 3 tiers" },
              { k: "4 weeks", v: "Starter session plan" },
              { k: "10–15 min", v: "Per session, 3× / week" },
            ].map((s) => (
              <div
                key={s.v}
                className="border-l-4 border-[#a3e635] pl-3 py-1"
              >
                <div className="text-2xl font-black tracking-tighter text-[#0a1832]">
                  {s.k}
                </div>
                <div className="text-[11px] tracking-wider uppercase font-bold text-slate-500">
                  {s.v}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-slate-600 leading-relaxed max-w-2xl">
            Built by Philip Lund + Paul Hanson — two coaches with 40+ combined
            years in U.S. youth soccer development. Trusted by Rec, Travel,
            ECNL, MLS Next clubs and college programs.
          </p>
        </header>

        {/* SECTION 1 — METHODOLOGY */}
        <section className="mb-12 avoid-break">
          <div className="text-[10px] tracking-[0.32em] uppercase font-extrabold text-[#1d4ed8] mb-2">
            Section 1
          </div>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#0a1832] mb-5">
            The European Way: Technique Before Tactics
          </h2>
          <div className="serif text-lg text-[#0a1832] leading-relaxed space-y-4">
            <p>
              The best youth academies in Europe don&apos;t start with
              tactics. They start with touch.
            </p>
            <p>
              By the time a Spanish or Dutch academy player is 14, they have
              tens of thousands of clean, deliberate touches with the ball.
              By contrast, U.S. youth players spend their early development
              years inside team-tactics frameworks built for adult
              performance — and the gap shows up at 17, 18, when the
              technical ceiling matters.
            </p>
            <p>
              TEKKY<sup className="text-[0.55em] -ml-px top-[-0.45em]">®</sup>{" "}
              brings the European methodology to your roster. The ball is
              FIFA Size 3 control surface. FIFA Size 5 match-day weight.
              The combination forces what every academy coach in Europe
              already knows: when the surface is smaller, sloppy touches
              get punished, and a player who can master the smaller ball
              feels the regulation ball as obvious by comparison.
            </p>
            <p className="font-bold text-[#0a1832]">
              That&apos;s the Before &amp; After Effect.
            </p>
          </div>

          <div className="mt-7 grid sm:grid-cols-3 gap-4">
            {[
              {
                tag: "01",
                t: "Street football roots",
                b: "Iniesta, Modrić, the Brazilian generation — every great technical player came up on smaller surfaces, more touches, no coach yelling tactics.",
              },
              {
                tag: "02",
                t: "Touch before tactics",
                b: "Tactics need a base of technique. Without a clean first touch, the prettiest formation falls apart at U14.",
              },
              {
                tag: "03",
                t: "Driveway, daily",
                b: "10–15 minutes a day with the right tool beats one 90-min team session a week. TEKKY makes daily reps possible at home.",
              },
            ].map((p) => (
              <div
                key={p.tag}
                className="border border-slate-200 bg-slate-50 p-4 rounded"
              >
                <div className="text-[9px] tracking-[0.28em] uppercase font-extrabold text-[#1d4ed8]">
                  {p.tag}
                </div>
                <h3 className="mt-1 font-black uppercase text-[15px] tracking-tight text-[#0a1832]">
                  {p.t}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {p.b}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2 — DRILL LIBRARY */}
        <section className="mb-12 page-break-before">
          <div className="text-[10px] tracking-[0.32em] uppercase font-extrabold text-[#1d4ed8] mb-2">
            Section 2
          </div>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#0a1832] mb-5">
            The TEKKY<sup className="text-[0.4em] -ml-1 top-[-0.65em]">®</sup>{" "}
            Drill Library
          </h2>
          <p className="text-base text-slate-700 leading-relaxed mb-8 max-w-3xl">
            26 drills across three tiers. Run a Warm Up sequence at the top
            of every session. Layer in Beginner reps for U8–U12, then
            graduate the players who own those moves into the Intermediate
            combos. Every drill links to a video.
          </p>

          {TIERS.map((tier, ti) => (
            <div
              key={tier.label}
              className={
                "mb-10 " + (ti > 0 ? "page-break-before" : "")
              }
            >
              <div className="border-t-2 border-[#0a1832] pt-5 mb-5 flex items-end justify-between flex-wrap gap-2">
                <div>
                  <div className="text-[9px] tracking-[0.28em] uppercase font-extrabold text-[#1d4ed8]">
                    Tier {ti + 1} · {tier.ageRange}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#0a1832]">
                    {tier.label}
                  </h3>
                </div>
                <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                  {tier.drills.length} drills
                </div>
              </div>
              <p className="serif text-base text-[#0a1832] leading-relaxed mb-6 max-w-3xl">
                {tier.intro}
              </p>

              <ol className="space-y-3">
                {tier.drills.map((d, i) => (
                  <li
                    key={d.id}
                    className="avoid-break border border-slate-200 rounded p-4 grid grid-cols-[28px_1fr] gap-3"
                  >
                    <div className="text-2xl font-black text-[#a3e635] tabular-nums leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <h4 className="text-base font-black uppercase tracking-tight text-[#0a1832]">
                          {d.name}
                        </h4>
                        <a
                          href={`https://www.youtube.com/watch?v=${d.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold tracking-wider uppercase text-[#1d4ed8] hover:text-[#0a1832]"
                        >
                          Watch ↗
                        </a>
                      </div>
                      <p className="mt-1 text-[13px] leading-relaxed text-slate-700">
                        <span className="font-bold text-slate-900">Why: </span>
                        {d.why}
                      </p>
                      <p className="mt-1 text-[13px] leading-relaxed text-[#0a1832] italic">
                        <span className="not-italic font-bold">Cue: </span>
                        &ldquo;{d.cue}&rdquo;
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </section>

        {/* SECTION 3 — 4-WEEK PLAN */}
        <section className="mb-12 page-break-before">
          <div className="text-[10px] tracking-[0.32em] uppercase font-extrabold text-[#1d4ed8] mb-2">
            Section 3
          </div>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#0a1832] mb-5">
            4-Week Starter Session Plan
          </h2>
          <p className="text-base text-slate-700 leading-relaxed mb-8 max-w-3xl">
            Three sessions a week, 10–15 min each (drop into your existing
            warm-up). By the end of week 4, run the BAE Test on Friday — the
            players themselves will tell you what changed.
          </p>

          {WEEKLY_PLAN.map((w) => (
            <div
              key={w.week}
              className="mb-7 border-t border-slate-300 pt-5 avoid-break"
            >
              <div className="flex items-baseline justify-between flex-wrap gap-2 mb-4">
                <h3 className="text-xl font-black uppercase tracking-tight text-[#0a1832]">
                  {w.week}
                </h3>
                <span className="text-[11px] uppercase tracking-wider font-bold text-[#1d4ed8]">
                  Focus: {w.focus}
                </span>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                {w.sessions.map((s) => (
                  <div
                    key={s.day}
                    className="border border-slate-200 bg-slate-50 rounded p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#0a1832] text-white text-[10px] font-extrabold tracking-wider">
                        {s.day}
                      </span>
                      <span className="font-black text-[14px] uppercase tracking-tight text-[#0a1832]">
                        {s.title}
                      </span>
                    </div>
                    <p className="text-[12px] leading-relaxed text-slate-700">
                      {s.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* SECTION 4 — COACHING GUARDRAILS */}
        <section className="mb-12 avoid-break page-break-before">
          <div className="text-[10px] tracking-[0.32em] uppercase font-extrabold text-[#1d4ed8] mb-2">
            Section 4
          </div>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#0a1832] mb-5">
            Coaching Guardrails
          </h2>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="border-l-4 border-emerald-500 pl-4 py-1">
              <h3 className="text-[11px] tracking-[0.28em] uppercase font-extrabold text-emerald-700 mb-3">
                Always
              </h3>
              <ul className="space-y-2 text-[14px] leading-relaxed text-slate-800">
                {[
                  "Lead the warm-up. Players model your tempo.",
                  "Praise clean touches more than fast touches.",
                  "Coach in 30-second cues, not lectures.",
                  "Run the BAE test at month-end. Let players name the change.",
                  "Pair high-performers with strugglers — peer reps stick longer.",
                ].map((s) => (
                  <li key={s} className="flex gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-l-4 border-rose-500 pl-4 py-1">
              <h3 className="text-[11px] tracking-[0.28em] uppercase font-extrabold text-rose-700 mb-3">
                Never
              </h3>
              <ul className="space-y-2 text-[14px] leading-relaxed text-slate-800">
                {[
                  "Skip the warm-up. The ball will punish unprepared ankles.",
                  "Drill new moves at full speed. Clean first, fast second.",
                  "Use TEKKY in matches. It's a training tool, not a game ball.",
                  "Run more than 25 minutes of TEKKY in one session. Fatigue degrades technique.",
                  "Replace your tactical work with TEKKY. It complements, doesn't replace.",
                ].map((s) => (
                  <li key={s} className="flex gap-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CLOSING */}
        <section className="border-t-4 border-[#0a1832] pt-8 avoid-break">
          <div className="serif text-2xl text-[#0a1832] italic leading-relaxed">
            &ldquo;The ball does the coaching for me. My U13s aren&apos;t
            getting away with sloppy first touches anymore — the ball
            won&apos;t let them.&rdquo;
          </div>
          <div className="mt-3 text-[11px] tracking-wider uppercase font-bold text-[#1d4ed8]">
            — DOC, ECNL Club (verified buyer)
          </div>

          <div className="mt-10 grid sm:grid-cols-3 gap-3 text-sm">
            <div className="bg-[#0a1832] text-white p-4 rounded">
              <div className="text-[9px] tracking-wider uppercase font-extrabold text-[#a3e635]">
                Request a club demo
              </div>
              <div className="mt-1 text-[13px]">
                30 min, in person if you&apos;re in WA, video anywhere else.
              </div>
              <a
                href="https://bluejayportfolio.com/clients/zenith-sports#contact"
                className="mt-2 inline-block text-[11px] font-bold underline"
              >
                bluejayportfolio.com/clients/zenith-sports#contact
              </a>
            </div>
            <div className="bg-slate-100 p-4 rounded">
              <div className="text-[9px] tracking-wider uppercase font-extrabold text-[#1d4ed8]">
                Bulk-order direct
              </div>
              <div className="mt-1 text-[13px] text-slate-700">
                Club discount available on roster orders.
              </div>
              <a
                href="https://bluejayportfolio.com/clients/zenith-sports/shop"
                className="mt-2 inline-block text-[11px] font-bold underline text-[#1d4ed8]"
              >
                Shop the TEKKY®
              </a>
            </div>
            <div className="bg-slate-100 p-4 rounded">
              <div className="text-[9px] tracking-wider uppercase font-extrabold text-[#1d4ed8]">
                Contact direct
              </div>
              <div className="mt-1 text-[13px] text-slate-700">
                Philip + Paul personally read every email.
              </div>
              <a
                href="mailto:info@zenithsports.org"
                className="mt-2 inline-block text-[11px] font-bold underline text-[#1d4ed8]"
              >
                info@zenithsports.org
              </a>
            </div>
          </div>

          <div className="mt-10 pt-5 border-t border-slate-200 text-center text-[10px] tracking-wider uppercase text-slate-500">
            © 2025 Zenith Sports, LLC · TEKKY® is a registered trademark · Patent Pending · Building Better Players, One Touch at a Time.
          </div>
        </section>
      </article>
    </main>
  );
}
