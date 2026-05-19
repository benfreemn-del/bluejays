export const dynamic = "force-static";
export const revalidate = 3600;

const body = `# Zenith Sports / TEKKY® — Youth Soccer Training Ball + Curriculum

> Patent-pending soccer training ball built smaller than regulation but weighted to FIFA Size 5 spec — the European technique-before-tactics methodology brought to U.S. youth players. Founded by Philip Lund + Paul Hanson, two coaches with 40+ combined years in U.S. youth soccer development. Trusted by Rec, Travel, ECNL, MLS Next clubs and college programs.

## The TEKKY®

- **Smaller surface, regulation weight** — FIFA Size 3 control surface with FIFA Size 5 match-day weight. Forces clean first touches; sloppy reps get punished. Players who master the TEKKY feel the regulation ball as obvious by comparison. ([Buy the TEKKY](https://bluejayportfolio.com/clients/zenith-sports/shop))
- **The Before & After Effect (BAE)** — players who train with TEKKY for 10-15 min/day for 4 weeks visibly improve first touch, ball mastery, and confidence on a regulation ball. The transfer is what closes the technical ceiling gap U.S. players hit at 17-18.

## Services

- **TEKKY® training ball** — $59.95 per ball. Available in size U6-U8, U9-U12, U13+. ([Shop](https://bluejayportfolio.com/clients/zenith-sports/shop))
- **Coaching guide (free PDF)** — 26-drill library + 4-week starter plan. The European methodology brought to your driveway, your training pitch, and your roster. ([Get the guide](https://bluejayportfolio.com/clients/zenith-sports/training-guide))
- **Build Your Player** — interactive 5-step character builder. Plug in your child's role, skill level, and goals; we generate a personalized 4-week training plan. ([Build a plan](https://bluejayportfolio.com/clients/zenith-sports/build-your-player))
- **Camp Finder** — quiz-based recommendation engine that matches parents with the right TEKKY-aligned camps in their area. ([Find a camp](https://bluejayportfolio.com/clients/zenith-sports/camps))
- **Partner Program** — coaches earn $25/ball + $100/coaching-package signup. Clubs get wholesale ($30-40/ball). Camps add co-branded balls to registration. Parents earn $20/referral. ([Apply](https://bluejayportfolio.com/clients/zenith-sports/partners))
- **TEKKY® Performance Apparel** — high-performance grip socks ($15), training shirts ($17.50). ([Shop apparel](https://bluejayportfolio.com/clients/zenith-sports/shop))

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
- **Website:** https://bluejayportfolio.com/clients/zenith-sports
- **Instagram:** https://www.instagram.com/zenithsports.tekky
- **Facebook:** https://www.facebook.com/zenithsports.tekky

## Key Pages

- [Home / The TEKKY® Story](https://bluejayportfolio.com/clients/zenith-sports)
- [Shop — Balls + Apparel](https://bluejayportfolio.com/clients/zenith-sports/shop)
- [Training Guide — 26 drills + 4-week plan](https://bluejayportfolio.com/clients/zenith-sports/training-guide)
- [Build Your Player — interactive plan generator](https://bluejayportfolio.com/clients/zenith-sports/build-your-player)
- [Camp Finder — find TEKKY-aligned camps](https://bluejayportfolio.com/clients/zenith-sports/camps)
- [Partner Program — coaches, clubs, camps, parents](https://bluejayportfolio.com/clients/zenith-sports/partners)
- [Contact — request a club demo](https://bluejayportfolio.com/clients/zenith-sports#contact)

---

Built by [BlueJays](https://bluejayportfolio.com/audit) — get your free site audit.
`;

export function GET() {
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
