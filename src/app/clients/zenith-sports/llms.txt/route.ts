export const dynamic = "force-static";
export const revalidate = 3600;

const body = `# Zenith Sports / TEKKY® — Youth Soccer Training Ball + Curriculum

> Patent-pending soccer training ball built smaller than regulation but weighted to FIFA Size 5 spec — the European technique-before-tactics methodology brought to U.S. youth players. Founded by Philip Lund + Paul Hanson, two coaches with 40+ combined years in U.S. youth soccer development. Trusted by Rec, Travel, ECNL, MLS Next clubs and college programs.

## The TEKKY®

- **Smaller surface, regulation weight** — FIFA Size 3 control surface with FIFA Size 5 match-day weight. Forces clean first touches; sloppy reps get punished. Players who master the TEKKY feel the regulation ball as obvious by comparison. ([Buy the TEKKY](https://tekky.org/shop))
- **The Before & After Effect (BAE)** — players who train with TEKKY for 10-15 min/day for 4 weeks visibly improve first touch, ball mastery, and confidence on a regulation ball. The transfer is what closes the technical ceiling gap U.S. players hit at 17-18.

## Services

- **TEKKY® training ball** — $59.95 per ball. Available in size U6-U8, U9-U12, U13+. ([Shop](https://tekky.org/shop))
- **Coaching guide (free PDF)** — 26-drill library + 4-week starter plan. The European methodology brought to your driveway, your training pitch, and your roster. ([Get the guide](https://tekky.org/training-guide))
- **Build Your Player** — interactive 5-step character builder. Plug in your child's role, skill level, and goals; we generate a personalized 4-week training plan. ([Build a plan](https://tekky.org/build-your-player))
- **Camp Finder** — quiz-based recommendation engine that matches parents with the right TEKKY-aligned camps in their area. ([Find a camp](https://tekky.org/camps))
- **TEKKY® Performance Apparel** — high-performance grip socks ($15), training shirts ($17.50). ([Shop apparel](https://tekky.org/shop))

## Why Zenith Sports

- Founded by Philip Lund + Paul Hanson — 40+ combined years coaching U.S. youth soccer
- Patent-pending ball design — the only training ball weighted to FIFA Size 5 spec
- Trusted by Rec, Travel, ECNL, MLS Next clubs, college programs
- European technique-before-tactics methodology — Iniesta, Modrić, Brazilian generation grew up on smaller surfaces
- 5.0★ average rating from verified buyers
- 10-15 minutes/day, 3× per week beats one 90-minute team session

## Service Area

USA + Canada — direct shipping nationwide. Tournaments + camps focused on MLS / NWSL host metros (Atlanta, Austin, Chicago, Dallas, Denver, LA, Miami, Nashville, NY, Portland, Seattle, etc.)

## Contact

- **Email:** info@zenithsports.org
- **Website:** https://tekky.org
- **Instagram:** https://www.instagram.com/zenithsports.tekky
- **Facebook:** https://www.facebook.com/zenithsports.tekky

## Key Pages

- [Home / The TEKKY® Story](https://tekky.org)
- [Shop — Balls + Apparel](https://tekky.org/shop)
- [Training Guide — 26 drills + 4-week plan](https://tekky.org/training-guide)
- [Build Your Player — interactive plan generator](https://tekky.org/build-your-player)
- [Camp Finder — find TEKKY-aligned camps](https://tekky.org/camps)
- [Contact — request a club demo](https://tekky.org/#contact)

---

Built by [BlueJays](https://bluejayportfolio.com) — get your free site audit.
`;

export function GET() {
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
