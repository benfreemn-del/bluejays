/* eslint-disable @next/next/no-img-element -- Static marketing showcase uses plain img tags intentionally. */

/**
 * /clients/greatminds-ae — Great Minds Early Childhood Center (Dubai, UAE).
 *
 * Bespoke premium showcase for inbound audit lead. Founded 2014 by Areti
 * Panagiotou (MSc Speech & Language Therapy, Montessori-certified). A
 * Montessori nursery + preschool serving children 1-6yrs from a villa on
 * Street 29, Al Wasl (next to City Walk, behind Box Park). American
 * Montessori Society member; Edarabia 2023 Parents' Choice Award winner.
 *
 * Visual language: warm ivory parchment + deep editorial navy + soft
 * terracotta accent. Calm, confident, genuinely-premium — the kind of
 * Dubai parent who reads The School Run and Vogue Arabia, not the kind
 * who wants primary-color ball pits. Sharp corners, hairline rules,
 * editorial serif headlines, sans body. NO Unsplash — all photography
 * is Great Minds' own, pulled from greatminds.ae.
 *
 * To wire as the prospect's preview URL:
 *   update prospects set
 *     pricing_tier = 'custom',
 *     custom_site_url = '/clients/greatminds-ae'
 *   where slug-of-record matches Great Minds.
 */

import {
  Phone,
  MapPin,
  Envelope,
  ArrowRight,
  ArrowUpRight,
  Quotes,
  CheckCircle,
  CalendarBlank,
  Sparkle,
  Butterfly,
  Bug,
  Sun,
  Moon,
  Heart,
  HandHeart,
  GraduationCap,
  Books,
  PaintBrush,
  MusicNote,
  Globe,
  Calculator,
  Leaf,
  Tree,
  ChalkboardTeacher,
  Lego,
  Cookie,
  PersonSimpleRun,
  Star,
  Certificate,
  ChatCircleText,
  ClipboardText,
  Notebook,
  Door,
  House,
  InstagramLogo,
  FacebookLogo,
  LinkedinLogo,
} from "@phosphor-icons/react/dist/ssr";

import StickyNav from "./sticky-nav";
import InquiryForm from "@/components/clients/InquiryForm";

/* ───────────────────────── BUSINESS ───────────────────────── */
const BUSINESS = {
  name: "Great Minds Early Childhood Center",
  shortName: "Great Minds",
  founder: "Areti Panagiotou",
  founderRole: "Founder & Principal",
  manager: "Ana Stevanov",
  managerRole: "Nursery Manager",
  founded: 2014,
  phoneDisplay: "+971 4 344 5222",
  phoneHref: "tel:+97143445222",
  email: "info@greatminds.ae",
  emailHref: "mailto:info@greatminds.ae",
  address: {
    line1: "Villa 11, Street 29",
    line2: "Al Wasl (next to City Walk, behind Box Park)",
    city: "Dubai, United Arab Emirates",
  },
  instagram: "https://www.instagram.com/greatmindsnursery",
  facebook: "https://www.facebook.com/greatmindsnursery",
  linkedin: "https://www.linkedin.com/company/greatmindsnursery",
} as const;

/* ───────────────────────── PHOTOS (curl-verified 200) ───────────────────────── */
const PHOTOS = {
  // Hero — the villa exterior / nursery building
  heroBuilding:
    "https://i0.wp.com/greatminds.ae/wp-content/uploads/2025/06/great-minds-montessori-nursery-dubai.webp",
  heroEntrance:
    "https://i0.wp.com/greatminds.ae/wp-content/uploads/2025/02/great-minds-nursery-dubai-front-entrance.webp",

  // Founder + manager
  founderPortrait:
    "https://i0.wp.com/greatminds.ae/wp-content/uploads/2025/02/great-minds-nursery-dubai-Areti-Panagiotou.webp",
  managerPortrait:
    "https://i0.wp.com/greatminds.ae/wp-content/uploads/2025/02/great-minds-nursery-dubai-ana-stevanov.webp",

  // Class photos (one per age group)
  classButterflies:
    "https://i0.wp.com/greatminds.ae/wp-content/uploads/2025/06/great-minds-nursery-dubai-butterflies-montessori-classes.webp",
  classBeetles:
    "https://i0.wp.com/greatminds.ae/wp-content/uploads/2025/06/great-minds-nursery-dubai-beetles-montessori-classes.webp",
  classBats:
    "https://i0.wp.com/greatminds.ae/wp-content/uploads/2025/06/great-minds-nursery-dubai-bats-montessori-classes.webp",
  classBees:
    "https://i0.wp.com/greatminds.ae/wp-content/uploads/2025/06/great-minds-nursery-dubai-bees-montessori-classes.webp",

  // Classrooms / interior
  classroomBats:
    "https://i0.wp.com/greatminds.ae/wp-content/uploads/2025/02/great-minds-nursery-dubai-montessori-classroom-bats.webp",
  classroomBees:
    "https://i0.wp.com/greatminds.ae/wp-content/uploads/2025/02/great-minds-nursery-dubai-montessori-classroom-bees.webp",
  classroomButterflies:
    "https://i0.wp.com/greatminds.ae/wp-content/uploads/2025/06/great-minds-montessori-nursery-dubai-montessori-classroom-butterflies.webp",
  classroomBeetles:
    "https://i0.wp.com/greatminds.ae/wp-content/uploads/2025/06/great-minds-montessori-nursery-dubai-montessori-classroom-beetles-scaled.webp",
  indoorLearning:
    "https://i0.wp.com/greatminds.ae/wp-content/uploads/2025/06/great-minds-montessori-nursery-dubai-montessori-indoor-learning-area.webp",
  bayWindow:
    "https://i0.wp.com/greatminds.ae/wp-content/uploads/2025/02/great-minds-nursery-dubai-montessori-bay-window.webp",
  softPlay:
    "https://i0.wp.com/greatminds.ae/wp-content/uploads/2025/02/great-minds-nursery-dubai-montessori-soft-surface-play-area.webp",

  // Outdoor
  outdoorPlay:
    "https://i0.wp.com/greatminds.ae/wp-content/uploads/2025/02/great-minds-nursery-dubai-outdoor-play-area.webp",
  outdoorLearning:
    "https://i0.wp.com/greatminds.ae/wp-content/uploads/2025/02/great-minds-nursery-dubai-montessori-outdoor-learning.webp",
  playground:
    "https://i0.wp.com/greatminds.ae/wp-content/uploads/2025/06/great-minds-nursery-dubai-playground.webp",
  sandPlay:
    "https://i0.wp.com/greatminds.ae/wp-content/uploads/2025/06/great-minds-nursery-dubai-outdoor-play-area-sand.webp",

  // Activities
  cooking:
    "https://i0.wp.com/greatminds.ae/wp-content/uploads/2025/02/great-minds-nursery-activities-cooking.webp",
  cookingSkills:
    "https://i0.wp.com/greatminds.ae/wp-content/uploads/2025/02/great-minds-nursery-activities-cooking-classes.webp",
  music:
    "https://i0.wp.com/greatminds.ae/wp-content/uploads/2025/02/great-minds-nursery-music-classes.webp",
  violin:
    "https://i0.wp.com/greatminds.ae/wp-content/uploads/2025/02/great-minds-nursery-activities-violin.webp",
  childActivities:
    "https://i0.wp.com/greatminds.ae/wp-content/uploads/2025/02/great-minds-nursery-childrens-activities.webp",

  // Brand
  logo: "https://i0.wp.com/greatminds.ae/wp-content/uploads/2025/01/Great-Minds-Logo-no-Text.webp",
  amsBadge:
    "https://i0.wp.com/greatminds.ae/wp-content/uploads/2025/06/American-Montessori-Society-Great-Minds.webp",
  edarabiaAward:
    "https://i0.wp.com/greatminds.ae/wp-content/uploads/2020/08/Edarabia-Great-Minds-Dubai-Parnts-Choice-Award-2023.webp",
} as const;

/* ───────────────────────── PALETTE ─────────────────────────
   Warm ivory parchment base. Deep editorial navy as primary ink.
   Soft terracotta accent for headlines + focal moments. Charcoal body.
   Inspired by editorial print magazines (Cereal, Kinfolk Family) rather
   than primary-color preschool clichés. */
const BG = "#f7f3ec";          // warm ivory parchment
const BG_DEEP = "#ede5d3";     // sandy cream for alternate sections
const BG_INK = "#0f1f3a";      // deep editorial navy — alt section bg
const PANEL = "#fdfaf3";       // off-white panel
const INK = "#1f2433";         // near-black body
const INK_SOFT = "#5a6075";    // muted body
const NAVY = "#0f1f3a";        // primary ink
const NAVY_DEEP = "#0a1428";
const NAVY_SOFT = "#6a7185";   // muted navy for labels/eyebrows
const TERRACOTTA = "#b56240";  // warm earth accent
const SAND = "#d9c9a8";        // dusty desert sand secondary
const GOLD = "#c4933b";        // restrained accent gold (used very sparingly)

/* ───────────────────────── COPY BLOCKS ───────────────────────── */
const CLASSES = [
  {
    name: "Butterflies",
    age: "1 to 2 years",
    icon: Butterfly,
    photo: PHOTOS.classButterflies,
    classroom: PHOTOS.classroomButterflies,
    blurb:
      "The first step away from the world of grown-ups. A tender, flexible programme where naps, feeds and nappies bend around each child — never the other way around. Sensory play, music, art, sand and gentle introduction to community life.",
    pillars: ["Sensory exploration", "Music & rhythm", "Art & messy play", "Practical-life beginnings"],
    schedule: "Flexible — naps & toilet routines tailored to each child",
  },
  {
    name: "Beetles",
    age: "2 to 3 years",
    icon: Bug,
    photo: PHOTOS.classBeetles,
    classroom: PHOTOS.classroomBeetles,
    blurb:
      "The Montessori environment opens up. Practical-life work, sensorial materials, early language and mathematics in concrete form. Twice-weekly Arabic and PE; cooking, music and art woven through the week.",
    pillars: ["Practical life", "Sensorial materials", "Arabic (twice weekly)", "Cooking, music, art, PE"],
    schedule: "Structured circle time + child-led work cycle",
  },
  {
    name: "Bats — FS1 / FS2",
    age: "3 to 5 years",
    icon: Sparkle,
    photo: PHOTOS.classBats,
    classroom: PHOTOS.classroomBats,
    blurb:
      "Cosmic education enters: geography, botany, zoology, history. Language and mathematics readiness through Montessori materials that turn abstract concepts into something the hands can understand. PE twice weekly.",
    pillars: ["Cosmic curriculum", "Language readiness", "Maths with Montessori materials", "Cultural studies"],
    schedule: "Full Montessori work cycle + enrichment",
  },
  {
    name: "Bees",
    age: "4 to 6 years",
    icon: Sun,
    photo: PHOTOS.classBees,
    classroom: PHOTOS.classroomBees,
    blurb:
      "The threshold of formal schooling. Self-directed work in language, mathematics and the cultural subjects. Children begin reading and writing — composing their first sentences and short stories — under careful, unhurried guidance.",
    pillars: ["Reading & early writing", "Mathematics in operation", "Self-directed work cycles", "School-readiness"],
    schedule: "Extended day option available",
  },
] as const;

const CURRICULUM = [
  {
    title: "Practical Life",
    icon: Leaf,
    body:
      "The work that comes first. Pouring, sweeping, fastening, polishing, dressing, caring for plants. Quiet, purposeful tasks that build coordination, concentration, independence — and a sense of being genuinely useful in the world.",
  },
  {
    title: "Sensorial",
    icon: Sparkle,
    body:
      "Materials engineered by Maria Montessori herself: pink towers, brown stairs, colour tablets, sound boxes, smelling jars. Each one isolates a single quality — size, weight, texture, pitch — so children build the fine discriminations that underpin all later learning.",
  },
  {
    title: "Language",
    icon: Books,
    body:
      "Precise vocabulary from the very first day. Sandpaper letters under little fingers. Movable alphabets that let children write before they can hold a pencil. A path into reading that respects how young brains actually want to learn it.",
  },
  {
    title: "Mathematics",
    icon: Calculator,
    body:
      "Number rods, golden beads, spindle boxes — concrete material first, abstraction afterwards. Children meet quantity through their hands long before they meet it on paper. By the Bees room, simple operations are second nature.",
  },
  {
    title: "Cultural Studies",
    icon: Globe,
    body:
      "Geography, botany, zoology, history. Continents, climates, the families of the animal kingdom, the timeline of life. The point isn't memorisation — it's wonder, and the sense that the world is theirs to understand.",
  },
  {
    title: "Creative Development",
    icon: PaintBrush,
    body:
      "Art, craft, drama, movement, song. Spontaneous and structured both. Materials freely chosen, work freely abandoned — the way children themselves know creativity actually works.",
  },
  {
    title: "Music",
    icon: MusicNote,
    body:
      "Weekly thirty-minute music sessions led by a specialist. Rhythm, song, instruments in small hands, the early ear-training that makes formal music study so much easier later on.",
  },
  {
    title: "Physical Education",
    icon: PersonSimpleRun,
    body:
      "Twice-weekly indoor and outdoor PE that builds gross-motor strength alongside the fine-motor work happening at the shelves. Climbing, balance, ball skills, the freedom of an outdoor play yard in the heart of Al Wasl.",
  },
  {
    title: "Cooking",
    icon: Cookie,
    body:
      "A real kitchen, real ingredients, real knives sized for small hands. Cooking is sensorial, mathematical, linguistic, cultural — and it sends children home proud of what they made today, with the recipe to repeat it.",
  },
] as const;

const DAY_SHAPE = [
  {
    time: "07:30 – 08:30",
    title: "Soft arrivals",
    body:
      "An unhurried welcome. Each child greeted individually at the door, settled into their classroom, given the space to choose where to begin.",
    icon: Door,
  },
  {
    time: "08:30 – 11:00",
    title: "The morning work cycle",
    body:
      "The heart of the Montessori day. A long, uninterrupted block of self-chosen work with the materials. The classroom hums quietly; teachers observe, present, step back.",
    icon: ChalkboardTeacher,
  },
  {
    time: "11:00 – 11:45",
    title: "Outdoor & PE",
    body:
      "Sand pit, climbing frame, pedal cars, scooters. Twice a week, structured PE with our specialist. Plenty of shade, plenty of water — Dubai-aware, year-round.",
    icon: Tree,
  },
  {
    time: "11:45 – 12:30",
    title: "Lunch together",
    body:
      "Nutritious meals, real cutlery, ceramic plates. Children serve themselves where they can, clear their own places, learn the small social rituals of a shared table.",
    icon: Cookie,
  },
  {
    time: "12:30 – 14:30",
    title: "Rest & quiet work",
    body:
      "The little ones nap; older children settle into reading corners, cosmic-curriculum exploration, or a second short work cycle. A genuinely calm afternoon.",
    icon: Moon,
  },
  {
    time: "14:30 – 15:30",
    title: "Enrichment & departure",
    body:
      "Music, art project work, cooking, Arabic. Then a gentle wind-down — story circle, songs — and home with a parent at the door.",
    icon: MusicNote,
  },
] as const;

const PHILOSOPHY = [
  {
    title: "Follow the child",
    body:
      "Every child arrives with their own developmental clock. Our job isn't to set the pace — it's to prepare the environment, observe carefully, and offer the right material at the right moment.",
    icon: Heart,
  },
  {
    title: "Respect, always",
    body:
      "We speak to a one-year-old the way we'd speak to anyone we genuinely respect. Real sentences, real choices, real responsibility. Children rise to meet how they're treated.",
    icon: HandHeart,
  },
  {
    title: "The prepared environment",
    body:
      "Every shelf, every material, every chair is chosen and placed with purpose. A beautiful room is not a luxury for small children — it is the curriculum itself.",
    icon: House,
  },
  {
    title: "Work is play, play is work",
    body:
      "We don't separate them. A child polishing a brass bell, washing a table, sorting colour tablets — that's the deepest play, and the most serious work. Both at once.",
    icon: Star,
  },
] as const;

const ENROLMENT_STEPS = [
  {
    n: "01",
    title: "Get in touch",
    body:
      "A short message through the form below or a call to the nursery. We'll send you our welcome pack and the most up-to-date class availability.",
    icon: ChatCircleText,
  },
  {
    n: "02",
    title: "Visit us in person",
    body:
      "Come for a tour during a working morning so you can see the children at their work — that's the only way to truly feel a Montessori environment. Allow 45 minutes.",
    icon: Door,
  },
  {
    n: "03",
    title: "Settling sessions",
    body:
      "Once enrolled, your child joins us for two short settling visits before their official start — with you, then briefly without — so the first proper day already feels familiar.",
    icon: HandHeart,
  },
  {
    n: "04",
    title: "Your child's first day",
    body:
      "A keyworker is assigned, a daily journal begins, and you receive a written observation note at the end of week one with how they've started to find their feet.",
    icon: Notebook,
  },
] as const;

const TESTIMONIALS = [
  {
    quote:
      "Great Minds is home away from home. There is warmth from all the staff, and knowing your child is in a safe and comfortable space is everything for a working parent in Dubai.",
    name: "Punit Ghumra",
    relation: "Parent",
  },
  {
    quote:
      "We toured nine nurseries before we walked into Great Minds. The difference was immediate — calm, focused children, an environment that respects them, and a team that knows every child by name.",
    name: "Verified parent review",
    relation: "Edarabia",
  },
  {
    quote:
      "Areti and her team treat early childhood with the seriousness it deserves. Two years here have set our daughter up for school in a way we didn't think was possible at this age.",
    name: "Verified parent review",
    relation: "Google reviews",
  },
] as const;

const FAQ = [
  {
    q: "What ages do you accept?",
    a: "Our youngest children join us at 12 months, and the Bees programme runs through to 6 years. Most children stay with us for three to four years, moving from Butterflies through Beetles, Bats and Bees as they're ready.",
  },
  {
    q: "Do you follow a specific curriculum?",
    a: "Yes — authentic Montessori, delivered by Montessori-trained teachers, with the official materials. We're a member of the American Montessori Society. Arabic is woven through the week from age two upward, and our older children are well-prepared for FS2 entry into both British and American curriculum schools.",
  },
  {
    q: "What are your hours?",
    a: "Our core day runs 07:30 to 15:30, Sunday to Thursday. Half-day, three-day and five-day attendance options are all available, and we offer extended care until 16:30 for working parents.",
  },
  {
    q: "Do you support children with additional needs?",
    a: "We do. Our Inclusion Programme welcomes children of determination with a dedicated specialist on the team, and our Individual Educational Programme (IEP) tailors support for any child who needs extra scaffolding to thrive. Speech and language is one of our founder's core specialisms.",
  },
  {
    q: "Where exactly are you?",
    a: "Villa 11, Street 29, Al Wasl — directly behind Box Park and a two-minute drive from City Walk. Plenty of parent parking, easy drop-off lane, and a fully shaded outdoor play area year-round.",
  },
  {
    q: "How do we tour?",
    a: "Tours run on weekday mornings between 09:00 and 11:00 so you can see the work cycle in action. Book through the form below or call us directly — we'll confirm a slot within one working day.",
  },
] as const;

/* ───────────────────────── PRIMITIVES ───────────────────────── */
function Eyebrow({
  children,
  color = NAVY_SOFT,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <div
      className="text-[11px] tracking-[0.28em] uppercase font-medium"
      style={{ color }}
    >
      {children}
    </div>
  );
}

function HairlineRule({ color = NAVY }: { color?: string }) {
  return <div className="h-px w-full" style={{ background: `${color}26` }} />;
}

/* ───────────────────────── PAGE ───────────────────────── */
export default function GreatMindsPage() {
  return (
    <main
      id="top"
      className="min-h-screen font-sans"
      style={{ background: BG, color: INK }}
    >
      <StickyNav
        businessName={BUSINESS.name}
        logoSrc={PHOTOS.logo}
        phoneDisplay={BUSINESS.phoneDisplay}
        phoneHref={BUSINESS.phoneHref}
      />

      {/* ─────────────── HERO ─────────────── */}
      <section className="relative overflow-hidden" style={{ background: BG }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8 pt-16 sm:pt-24 pb-20 sm:pb-28">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-end">
            {/* Left — copy */}
            <div className="lg:col-span-6 xl:col-span-5 space-y-8">
              <Eyebrow>
                Montessori nursery &middot; Al Wasl, Dubai &middot; since {BUSINESS.founded}
              </Eyebrow>
              <h1
                className="font-serif text-[44px] sm:text-[58px] lg:text-[64px] leading-[1.04] tracking-[-0.02em]"
                style={{ color: NAVY_DEEP }}
              >
                A genuinely{" "}
                <span style={{ color: TERRACOTTA, fontStyle: "italic" }}>
                  unhurried
                </span>{" "}
                early childhood &mdash; in the heart of Dubai.
              </h1>
              <p
                className="text-[17px] sm:text-[18px] leading-[1.65] max-w-[46ch]"
                style={{ color: INK_SOFT }}
              >
                Great Minds is an authentic Montessori nursery for children
                aged one to six, set in a quiet villa behind Box Park.
                Calm, prepared classrooms. Trained teachers. The kind of
                early years that parents recognise the moment they walk in.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#visit"
                  className="inline-flex items-center gap-2 px-7 py-4 text-[14px] font-medium tracking-wide transition"
                  style={{ background: NAVY, color: BG }}
                >
                  Book a morning tour
                  <ArrowRight size={16} weight="bold" />
                </a>
                <a
                  href="#about"
                  className="inline-flex items-center gap-2 text-[14px] font-medium tracking-wide pb-1 border-b transition"
                  style={{ color: NAVY_DEEP, borderColor: `${NAVY}55` }}
                >
                  Meet the founder
                </a>
              </div>

              <div className="pt-8 grid grid-cols-3 gap-6 max-w-md">
                <div>
                  <div
                    className="font-serif text-[30px] leading-none"
                    style={{ color: TERRACOTTA }}
                  >
                    10+
                  </div>
                  <div
                    className="mt-2 text-[11px] tracking-[0.18em] uppercase"
                    style={{ color: NAVY_SOFT }}
                  >
                    Years in Dubai
                  </div>
                </div>
                <div>
                  <div
                    className="font-serif text-[30px] leading-none"
                    style={{ color: TERRACOTTA }}
                  >
                    1&ndash;6
                  </div>
                  <div
                    className="mt-2 text-[11px] tracking-[0.18em] uppercase"
                    style={{ color: NAVY_SOFT }}
                  >
                    Years served
                  </div>
                </div>
                <div>
                  <div
                    className="font-serif text-[30px] leading-none"
                    style={{ color: TERRACOTTA }}
                  >
                    AMS
                  </div>
                  <div
                    className="mt-2 text-[11px] tracking-[0.18em] uppercase"
                    style={{ color: NAVY_SOFT }}
                  >
                    Society member
                  </div>
                </div>
              </div>
            </div>

            {/* Right — overlapping image card */}
            <div className="lg:col-span-6 xl:col-span-7 relative">
              <div className="relative aspect-[4/5] sm:aspect-[5/6] lg:aspect-[4/5] overflow-hidden">
                <img
                  src={PHOTOS.heroBuilding}
                  alt="Great Minds Montessori — the nursery villa in Al Wasl, Dubai"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div
                className="hidden sm:block absolute -bottom-10 -left-6 lg:-left-10 max-w-[320px] p-6 border"
                style={{
                  background: PANEL,
                  borderColor: `${NAVY}22`,
                  boxShadow: "0 18px 60px rgba(15, 31, 58, 0.10)",
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Quotes size={18} weight="fill" style={{ color: TERRACOTTA }} />
                  <Eyebrow>Founder&rsquo;s note</Eyebrow>
                </div>
                <p
                  className="font-serif text-[16px] leading-[1.5]"
                  style={{ color: NAVY_DEEP }}
                >
                  &ldquo;The early years are the foundation of every later
                  one. Our work is to give them the seriousness, the calm,
                  and the materials they truly deserve.&rdquo;
                </p>
                <div
                  className="mt-3 text-[12px] tracking-[0.18em] uppercase"
                  style={{ color: NAVY_SOFT }}
                >
                  &mdash; {BUSINESS.founder}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <HairlineRule />
        </div>
      </section>

      {/* ─────────────── TRUST RAIL ─────────────── */}
      <section className="py-10" style={{ background: BG }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-6">
            <Eyebrow>Recognition &amp; affiliation</Eyebrow>
            <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
              <img
                src={PHOTOS.amsBadge}
                alt="American Montessori Society — member"
                className="h-12 sm:h-14 w-auto opacity-90"
              />
              <img
                src={PHOTOS.edarabiaAward}
                alt="Edarabia 2023 Parents' Choice Award"
                className="h-12 sm:h-14 w-auto opacity-90"
              />
              <div
                className="text-[12px] tracking-[0.22em] uppercase font-medium"
                style={{ color: NAVY_SOFT }}
              >
                KHDA registered &middot; Dubai
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-5 sm:px-8 mt-10">
          <HairlineRule />
        </div>
      </section>

      {/* ─────────────── ABOUT — FOUNDER ─────────────── */}
      <section id="about" className="py-24 sm:py-32" style={{ background: BG }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={PHOTOS.founderPortrait}
                alt={`${BUSINESS.founder}, founder & principal of Great Minds Early Childhood Center`}
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className="hidden lg:block absolute -bottom-8 -right-8 p-5 border max-w-[240px]"
              style={{ background: PANEL, borderColor: `${NAVY}22` }}
            >
              <Eyebrow>Founder &amp; Principal</Eyebrow>
              <div
                className="mt-2 font-serif text-[22px] leading-tight"
                style={{ color: NAVY_DEEP }}
              >
                {BUSINESS.founder}
              </div>
              <div
                className="mt-1 text-[12px] tracking-wide"
                style={{ color: INK_SOFT }}
              >
                MSc Speech &amp; Language Therapy &middot; Montessori-certified
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-7">
            <Eyebrow>The story behind the villa</Eyebrow>
            <h2
              className="font-serif text-[36px] sm:text-[48px] leading-[1.06] tracking-[-0.015em]"
              style={{ color: NAVY_DEEP }}
            >
              Founded in {BUSINESS.founded} by a speech-and-language
              therapist who couldn&rsquo;t find what she was looking for
              &mdash; so she built it.
            </h2>
            <p
              className="text-[16px] sm:text-[17px] leading-[1.7] max-w-[60ch]"
              style={{ color: INK_SOFT }}
            >
              Areti Panagiotou trained first as an early-years teacher in
              Greece, then took her Master&rsquo;s in Speech and Language
              Therapy at City University of London, then her Montessori
              Diploma at the North America Montessori Center. After a decade
              working with children in the UK and Dubai, she opened Great
              Minds in 2014 with a clear conviction: that the early years
              deserve the most carefully prepared environment of all.
            </p>
            <p
              className="text-[16px] sm:text-[17px] leading-[1.7] max-w-[60ch]"
              style={{ color: INK_SOFT }}
            >
              Eleven years later, that conviction still shapes everything
              &mdash; the way the rooms are arranged, the way teachers are
              hired, the way a child&rsquo;s first morning is held. We are
              proudly small. We know every family by name.
            </p>

            <div className="pt-4 grid sm:grid-cols-2 gap-x-8 gap-y-5">
              {PHILOSOPHY.map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.title} className="flex gap-4">
                    <div
                      className="flex-shrink-0 w-10 h-10 inline-flex items-center justify-center"
                      style={{ background: `${NAVY}10`, color: NAVY }}
                    >
                      <Icon size={18} weight="duotone" />
                    </div>
                    <div>
                      <div
                        className="text-[14px] font-semibold"
                        style={{ color: NAVY_DEEP }}
                      >
                        {p.title}
                      </div>
                      <div
                        className="mt-1 text-[13.5px] leading-[1.6]"
                        style={{ color: INK_SOFT }}
                      >
                        {p.body}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-6 flex flex-wrap items-center gap-5">
              <a
                href="#visit"
                className="inline-flex items-center gap-2 px-6 py-3 text-[13px] font-medium tracking-wide transition"
                style={{ background: NAVY, color: BG }}
              >
                Tour the nursery
                <ArrowRight size={14} weight="bold" />
              </a>
              <a
                href="#contact"
                className="text-[13px] font-medium tracking-wide pb-1 border-b transition"
                style={{ color: NAVY_DEEP, borderColor: `${NAVY}55` }}
              >
                Send a question first
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── DEEP-NAVY EDITORIAL PULL QUOTE ─────────────── */}
      <section
        className="py-24 sm:py-32 relative overflow-hidden"
        style={{ background: BG_INK, color: BG }}
      >
        <div className="mx-auto max-w-5xl px-5 sm:px-8 text-center relative">
          <Quotes
            size={42}
            weight="fill"
            style={{ color: SAND, opacity: 0.7 }}
            className="mx-auto mb-8"
          />
          <p
            className="font-serif text-[28px] sm:text-[40px] lg:text-[46px] leading-[1.18] tracking-[-0.01em]"
            style={{ color: BG }}
          >
            &ldquo;The greatest gifts we can give our children are the
            roots of responsibility and the wings of independence.&rdquo;
          </p>
          <div
            className="mt-10 text-[12px] tracking-[0.28em] uppercase"
            style={{ color: SAND }}
          >
            Maria Montessori &mdash; the philosophy our practice is built on
          </div>
        </div>
      </section>

      {/* ─────────────── CLASSES ─────────────── */}
      <section id="classes" className="py-24 sm:py-32" style={{ background: BG }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-10 mb-16">
            <div className="lg:col-span-5">
              <Eyebrow>Four classrooms, four stages</Eyebrow>
              <h2
                className="mt-4 font-serif text-[36px] sm:text-[48px] leading-[1.06] tracking-[-0.015em]"
                style={{ color: NAVY_DEEP }}
              >
                A child&rsquo;s journey, from
                <br className="hidden sm:block" />
                first steps to school-ready.
              </h2>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <p
                className="text-[16px] sm:text-[17px] leading-[1.7]"
                style={{ color: INK_SOFT }}
              >
                Children move from Butterflies through Beetles, Bats and
                Bees as they&rsquo;re developmentally ready &mdash; never
                strictly by birthday. Each room is its own carefully
                prepared environment, sized and stocked for exactly the
                window of childhood it serves.
              </p>
            </div>
          </div>

          <div className="space-y-px" style={{ background: `${NAVY}22` }}>
            {CLASSES.map((c, i) => {
              const Icon = c.icon;
              const photo = i % 2 === 0 ? c.photo : c.classroom;
              const reverse = i % 2 === 1;
              return (
                <article
                  key={c.name}
                  className="grid lg:grid-cols-12 gap-0 items-stretch"
                  style={{ background: BG }}
                >
                  <div
                    className={`lg:col-span-5 ${reverse ? "lg:order-2" : ""}`}
                  >
                    <div className="aspect-[4/3] lg:aspect-auto lg:h-full overflow-hidden">
                      <img
                        src={photo}
                        alt={`${c.name} class — ages ${c.age}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-5">
                      <div
                        className="w-12 h-12 inline-flex items-center justify-center"
                        style={{ background: `${NAVY}10`, color: NAVY }}
                      >
                        <Icon size={22} weight="duotone" />
                      </div>
                      <div>
                        <div
                          className="text-[11px] tracking-[0.22em] uppercase"
                          style={{ color: TERRACOTTA }}
                        >
                          {c.age}
                        </div>
                        <h3
                          className="font-serif text-[28px] sm:text-[34px] leading-tight"
                          style={{ color: NAVY_DEEP }}
                        >
                          {c.name}
                        </h3>
                      </div>
                    </div>
                    <p
                      className="text-[15.5px] leading-[1.7] mb-6 max-w-[60ch]"
                      style={{ color: INK_SOFT }}
                    >
                      {c.blurb}
                    </p>
                    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mb-6">
                      {c.pillars.map((p) => (
                        <div
                          key={p}
                          className="flex items-start gap-2 text-[13.5px]"
                          style={{ color: NAVY_DEEP }}
                        >
                          <CheckCircle
                            size={14}
                            weight="duotone"
                            style={{ color: TERRACOTTA }}
                            className="mt-1 flex-shrink-0"
                          />
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                    <div
                      className="text-[12px] tracking-[0.18em] uppercase pt-4 border-t"
                      style={{
                        color: NAVY_SOFT,
                        borderColor: `${NAVY}1f`,
                      }}
                    >
                      {c.schedule}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────── SAND BAND : INCLUSION & ARABIC ─────────────── */}
      <section className="py-24 sm:py-32" style={{ background: BG_DEEP }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6">
            <Eyebrow>Beyond the core programme</Eyebrow>
            <h2
              className="mt-4 font-serif text-[36px] sm:text-[44px] leading-[1.08] tracking-[-0.015em]"
              style={{ color: NAVY_DEEP }}
            >
              Inclusion, Arabic, and the
              <br className="hidden sm:block" />
              extras that round out a real Dubai childhood.
            </h2>
            <div className="mt-10 space-y-7">
              <div className="flex gap-5">
                <div
                  className="flex-shrink-0 w-12 h-12 inline-flex items-center justify-center"
                  style={{ background: `${TERRACOTTA}15`, color: TERRACOTTA }}
                >
                  <HandHeart size={22} weight="duotone" />
                </div>
                <div>
                  <h3
                    className="font-serif text-[22px] mb-2"
                    style={{ color: NAVY_DEEP }}
                  >
                    Inclusion programme
                  </h3>
                  <p
                    className="text-[15px] leading-[1.7] max-w-[55ch]"
                    style={{ color: INK_SOFT }}
                  >
                    Children of determination are welcomed and supported by a
                    dedicated specialist, with our founder&rsquo;s speech-and-
                    language background informing day-to-day practice across
                    every classroom.
                  </p>
                </div>
              </div>
              <div className="flex gap-5">
                <div
                  className="flex-shrink-0 w-12 h-12 inline-flex items-center justify-center"
                  style={{ background: `${TERRACOTTA}15`, color: TERRACOTTA }}
                >
                  <ClipboardText size={22} weight="duotone" />
                </div>
                <div>
                  <h3
                    className="font-serif text-[22px] mb-2"
                    style={{ color: NAVY_DEEP }}
                  >
                    Individual Educational Programme (IEP)
                  </h3>
                  <p
                    className="text-[15px] leading-[1.7] max-w-[55ch]"
                    style={{ color: INK_SOFT }}
                  >
                    For any child who needs additional scaffolding to thrive
                    &mdash; a written plan, regular review meetings with
                    parents, and the discreet daily adjustments that make
                    school feel possible.
                  </p>
                </div>
              </div>
              <div className="flex gap-5">
                <div
                  className="flex-shrink-0 w-12 h-12 inline-flex items-center justify-center"
                  style={{ background: `${TERRACOTTA}15`, color: TERRACOTTA }}
                >
                  <Globe size={22} weight="duotone" />
                </div>
                <div>
                  <h3
                    className="font-serif text-[22px] mb-2"
                    style={{ color: NAVY_DEEP }}
                  >
                    Arabic from age two
                  </h3>
                  <p
                    className="text-[15px] leading-[1.7] max-w-[55ch]"
                    style={{ color: INK_SOFT }}
                  >
                    Twice-weekly Arabic language sessions woven through the
                    Beetles, Bats and Bees programmes &mdash; song, story,
                    vocabulary, and a genuine introduction to the
                    surrounding culture.
                  </p>
                </div>
              </div>
              <div className="flex gap-5">
                <div
                  className="flex-shrink-0 w-12 h-12 inline-flex items-center justify-center"
                  style={{ background: `${TERRACOTTA}15`, color: TERRACOTTA }}
                >
                  <PersonSimpleRun size={22} weight="duotone" />
                </div>
                <div>
                  <h3
                    className="font-serif text-[22px] mb-2"
                    style={{ color: NAVY_DEEP }}
                  >
                    Extracurricular &mdash; karate, football, dance, gymnastics
                  </h3>
                  <p
                    className="text-[15px] leading-[1.7] max-w-[55ch]"
                    style={{ color: INK_SOFT }}
                  >
                    Optional after-class activities run by visiting
                    specialists, available to Beetles, Bats and Bees families.
                    Sign-up term by term.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={PHOTOS.violin}
                  alt="Music — strings session"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-[3/4] overflow-hidden mt-10">
                <img
                  src={PHOTOS.cooking}
                  alt="Cooking — real ingredients, real knives sized for small hands"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-[3/4] overflow-hidden -mt-10">
                <img
                  src={PHOTOS.childActivities}
                  alt="Children at work in the prepared environment"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={PHOTOS.music}
                  alt="Weekly music sessions with a specialist teacher"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── CURRICULUM GRID ─────────────── */}
      <section
        id="curriculum"
        className="py-24 sm:py-32"
        style={{ background: BG }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-10 mb-16">
            <div className="lg:col-span-6">
              <Eyebrow>The nine curriculum areas</Eyebrow>
              <h2
                className="mt-4 font-serif text-[36px] sm:text-[48px] leading-[1.06] tracking-[-0.015em]"
                style={{ color: NAVY_DEEP }}
              >
                Authentic Montessori, delivered
                <br className="hidden sm:block" />
                with the original materials.
              </h2>
            </div>
            <div className="lg:col-span-5 lg:col-start-8 self-end">
              <p
                className="text-[16px] leading-[1.7]"
                style={{ color: INK_SOFT }}
              >
                Every curriculum area was designed by Maria Montessori
                herself, refined across more than a century of practice.
                We don&rsquo;t blend, we don&rsquo;t dilute &mdash; we
                deliver it the way it was meant to be delivered.
              </p>
            </div>
          </div>

          <div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px"
            style={{ background: `${NAVY}22` }}
          >
            {CURRICULUM.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.title}
                  className="p-8 sm:p-10"
                  style={{ background: BG }}
                >
                  <Icon
                    size={28}
                    weight="duotone"
                    style={{ color: TERRACOTTA }}
                    className="mb-6"
                  />
                  <h3
                    className="font-serif text-[22px] mb-3"
                    style={{ color: NAVY_DEEP }}
                  >
                    {c.title}
                  </h3>
                  <p
                    className="text-[14.5px] leading-[1.65]"
                    style={{ color: INK_SOFT }}
                  >
                    {c.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────── EDITORIAL IMAGE BREAK ─────────────── */}
      <section className="relative" style={{ background: BG }}>
        <div className="aspect-[16/7] sm:aspect-[21/8] overflow-hidden">
          <img
            src={PHOTOS.indoorLearning}
            alt="The prepared environment — Great Minds Montessori, Dubai"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* ─────────────── A DAY HERE ─────────────── */}
      <section id="day" className="py-24 sm:py-32" style={{ background: BG }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-10 mb-16">
            <div className="lg:col-span-5">
              <Eyebrow>A morning, an afternoon, a year</Eyebrow>
              <h2
                className="mt-4 font-serif text-[36px] sm:text-[48px] leading-[1.06] tracking-[-0.015em]"
                style={{ color: NAVY_DEEP }}
              >
                The shape of a day at
                <br className="hidden sm:block" />
                Great Minds.
              </h2>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <p
                className="text-[16px] sm:text-[17px] leading-[1.7]"
                style={{ color: INK_SOFT }}
              >
                Our day is structured around the long Montessori work
                cycle &mdash; the uninterrupted three-hour morning that
                lets young children settle into deep concentration.
                Mornings outdoors. Family-style lunches. Quiet afternoons.
                Pickup at 15:30, with extended care to 16:30.
              </p>
            </div>
          </div>

          <div className="space-y-px" style={{ background: `${NAVY}22` }}>
            {DAY_SHAPE.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.time}
                  className="grid lg:grid-cols-12 gap-6 p-8 sm:p-10 items-start"
                  style={{ background: BG }}
                >
                  <div className="lg:col-span-3">
                    <div
                      className="font-serif text-[26px] sm:text-[32px] leading-tight"
                      style={{ color: TERRACOTTA }}
                    >
                      {step.time}
                    </div>
                  </div>
                  <div className="lg:col-span-1 flex lg:justify-start">
                    <div
                      className="w-12 h-12 inline-flex items-center justify-center"
                      style={{ background: `${NAVY}10`, color: NAVY }}
                    >
                      <Icon size={22} weight="duotone" />
                    </div>
                  </div>
                  <div className="lg:col-span-8">
                    <h3
                      className="font-serif text-[24px] sm:text-[28px] mb-3"
                      style={{ color: NAVY_DEEP }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="text-[15.5px] leading-[1.7] max-w-[64ch]"
                      style={{ color: INK_SOFT }}
                    >
                      {step.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────── GALLERY MOSAIC ─────────────── */}
      <section className="py-24 sm:py-32" style={{ background: BG_DEEP }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-10 mb-14 items-end">
            <div className="lg:col-span-7">
              <Eyebrow>Inside the villa</Eyebrow>
              <h2
                className="mt-4 font-serif text-[36px] sm:text-[48px] leading-[1.06] tracking-[-0.015em]"
                style={{ color: NAVY_DEEP }}
              >
                The classrooms, the garden,
                <br className="hidden sm:block" />
                the small everyday work.
              </h2>
            </div>
            <div className="lg:col-span-4 lg:col-start-9">
              <p
                className="text-[16px] leading-[1.7]"
                style={{ color: INK_SOFT }}
              >
                Real photographs from a real working week &mdash; not
                staged, not stocked. The best way to know a nursery is
                still to come and see it.
              </p>
            </div>
          </div>

          <div
            className="grid grid-cols-2 lg:grid-cols-4 gap-px"
            style={{ background: `${NAVY}22` }}
          >
            <div className="aspect-square overflow-hidden lg:row-span-2 lg:aspect-auto">
              <img
                src={PHOTOS.classroomBats}
                alt="Bats classroom — prepared environment"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square overflow-hidden">
              <img
                src={PHOTOS.outdoorPlay}
                alt="Outdoor play area"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square overflow-hidden">
              <img
                src={PHOTOS.cookingSkills}
                alt="Cooking class"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square overflow-hidden lg:row-span-2 lg:aspect-auto">
              <img
                src={PHOTOS.bayWindow}
                alt="A reading corner by the bay window"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square overflow-hidden">
              <img
                src={PHOTOS.sandPlay}
                alt="Sand-pit play"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square overflow-hidden">
              <img
                src={PHOTOS.softPlay}
                alt="Soft surface play area for the youngest children"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square overflow-hidden">
              <img
                src={PHOTOS.outdoorLearning}
                alt="Outdoor Montessori learning"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square overflow-hidden">
              <img
                src={PHOTOS.classroomBees}
                alt="Bees classroom"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square overflow-hidden">
              <img
                src={PHOTOS.playground}
                alt="The playground"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── TEAM ─────────────── */}
      <section className="py-24 sm:py-32" style={{ background: BG }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-14 max-w-3xl">
            <Eyebrow>The team behind the rooms</Eyebrow>
            <h2
              className="mt-4 font-serif text-[36px] sm:text-[48px] leading-[1.06] tracking-[-0.015em]"
              style={{ color: NAVY_DEEP }}
            >
              Two leaders. Eleven years of
              continuous practice.
            </h2>
          </div>

          <div
            className="grid md:grid-cols-2 gap-px"
            style={{ background: `${NAVY}22` }}
          >
            <div className="p-8 sm:p-10" style={{ background: BG }}>
              <div className="aspect-[4/5] overflow-hidden mb-6">
                <img
                  src={PHOTOS.founderPortrait}
                  alt={BUSINESS.founder}
                  className="w-full h-full object-cover"
                />
              </div>
              <Eyebrow color={TERRACOTTA}>{BUSINESS.founderRole}</Eyebrow>
              <h3
                className="mt-3 font-serif text-[28px] leading-tight"
                style={{ color: NAVY_DEEP }}
              >
                {BUSINESS.founder}
              </h3>
              <p
                className="mt-4 text-[14.5px] leading-[1.65]"
                style={{ color: INK_SOFT }}
              >
                MSc Speech &amp; Language Therapy, City University of London.
                BSc Early Years Education, Greece. Montessori Diploma, North
                America Montessori Center. Founded Great Minds in 2014 after
                a decade of clinical and classroom practice in the UK and Dubai.
              </p>
            </div>
            <div className="p-8 sm:p-10" style={{ background: BG }}>
              <div className="aspect-[4/5] overflow-hidden mb-6">
                <img
                  src={PHOTOS.managerPortrait}
                  alt={BUSINESS.manager}
                  className="w-full h-full object-cover"
                />
              </div>
              <Eyebrow color={TERRACOTTA}>{BUSINESS.managerRole}</Eyebrow>
              <h3
                className="mt-3 font-serif text-[28px] leading-tight"
                style={{ color: NAVY_DEEP }}
              >
                {BUSINESS.manager}
              </h3>
              <p
                className="mt-4 text-[14.5px] leading-[1.65]"
                style={{ color: INK_SOFT }}
              >
                MSc in Education and Montessori-certified. Joined Great
                Minds in September 2014 &mdash; eleven years and counting.
                Day-to-day responsibility for the rooms, the team, and the
                family communication that keeps everything running quietly.
              </p>
            </div>
          </div>

          <div className="mt-12 grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <p
                className="font-serif text-[20px] sm:text-[24px] leading-[1.45]"
                style={{ color: NAVY_DEEP }}
              >
                Behind Areti and Ana, a team of qualified early-years
                educators &mdash; many with us since the doors opened.
                Low staff turnover is one of the quieter things parents
                notice, and it&rsquo;s one of the things we&rsquo;re
                proudest of.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── TESTIMONIALS — DEEP NAVY BAND ─────────────── */}
      <section className="py-24 sm:py-32" style={{ background: BG_INK, color: BG }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-10 mb-14">
            <div className="lg:col-span-6">
              <div
                className="text-[11px] tracking-[0.28em] uppercase font-medium"
                style={{ color: SAND }}
              >
                What families tell us
              </div>
              <h2
                className="mt-4 font-serif text-[36px] sm:text-[48px] leading-[1.06] tracking-[-0.015em]"
                style={{ color: BG }}
              >
                In the words of the
                <br className="hidden sm:block" />
                parents who chose us.
              </h2>
            </div>
            <div className="lg:col-span-5 lg:col-start-8 self-end">
              <p
                className="text-[16px] leading-[1.7]"
                style={{ color: "#cfd0d8" }}
              >
                We don&rsquo;t pay for placements, and we don&rsquo;t
                solicit reviews. The recognition we have, we&rsquo;ve
                earned the slow way &mdash; one family at a time.
              </p>
            </div>
          </div>

          <div
            className="grid md:grid-cols-3 gap-px"
            style={{ background: "#1c2c47" }}
          >
            {TESTIMONIALS.map((t) => (
              <article
                key={t.name + t.relation}
                className="p-8 sm:p-10 flex flex-col"
                style={{ background: BG_INK }}
              >
                <Quotes
                  size={28}
                  weight="fill"
                  style={{ color: SAND, opacity: 0.7 }}
                  className="mb-6"
                />
                <p
                  className="font-serif text-[18px] sm:text-[20px] leading-[1.45] mb-8 flex-grow"
                  style={{ color: BG }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div
                  className="text-[12px] tracking-[0.18em] uppercase border-t pt-5"
                  style={{ color: SAND, borderColor: "#2c3c5a" }}
                >
                  {t.name}
                  <span style={{ color: "#9aa1b3" }}> &middot; {t.relation}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── ENROLMENT STEPS ─────────────── */}
      <section className="py-24 sm:py-32" style={{ background: BG }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-10 mb-16">
            <div className="lg:col-span-5">
              <Eyebrow>Enrolment, step by step</Eyebrow>
              <h2
                className="mt-4 font-serif text-[36px] sm:text-[48px] leading-[1.06] tracking-[-0.015em]"
                style={{ color: NAVY_DEEP }}
              >
                From first enquiry to
                <br className="hidden sm:block" />
                first morning.
              </h2>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <p
                className="text-[16px] sm:text-[17px] leading-[1.7]"
                style={{ color: INK_SOFT }}
              >
                We keep the process simple, considered, and properly
                paced. No high-pressure sales calls, no rush to commit
                &mdash; the right Montessori environment is a long
                decision and we&rsquo;d rather you take your time.
              </p>
            </div>
          </div>

          <div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px"
            style={{ background: `${NAVY}22` }}
          >
            {ENROLMENT_STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.n}
                  className="p-8 sm:p-10 flex flex-col"
                  style={{ background: BG }}
                >
                  <div
                    className="font-serif text-[44px] leading-none mb-6"
                    style={{ color: TERRACOTTA }}
                  >
                    {s.n}
                  </div>
                  <div
                    className="w-11 h-11 inline-flex items-center justify-center mb-5"
                    style={{ background: `${NAVY}10`, color: NAVY }}
                  >
                    <Icon size={20} weight="duotone" />
                  </div>
                  <h3
                    className="font-serif text-[22px] mb-3"
                    style={{ color: NAVY_DEEP }}
                  >
                    {s.title}
                  </h3>
                  <p
                    className="text-[14px] leading-[1.65]"
                    style={{ color: INK_SOFT }}
                  >
                    {s.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────── FAQ ─────────────── */}
      <section className="py-24 sm:py-32" style={{ background: BG_DEEP }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <Eyebrow>The questions parents most often ask</Eyebrow>
            <h2
              className="mt-4 font-serif text-[36px] sm:text-[44px] leading-[1.08] tracking-[-0.015em]"
              style={{ color: NAVY_DEEP }}
            >
              Before you book a tour.
            </h2>
            <p
              className="mt-6 text-[15.5px] leading-[1.7] max-w-[40ch]"
              style={{ color: INK_SOFT }}
            >
              If your question isn&rsquo;t here, the form below reaches
              Ana directly &mdash; she&rsquo;ll come back to you within
              one working day.
            </p>
          </div>

          <div className="lg:col-span-8">
            <div className="space-y-px" style={{ background: `${NAVY}22` }}>
              {FAQ.map((f, i) => (
                <details
                  key={f.q}
                  className="group p-7 sm:p-8"
                  style={{ background: BG_DEEP }}
                  open={i === 0}
                >
                  <summary className="flex items-start justify-between gap-6 cursor-pointer list-none">
                    <h3
                      className="font-serif text-[19px] sm:text-[22px] leading-tight"
                      style={{ color: NAVY_DEEP }}
                    >
                      {f.q}
                    </h3>
                    <div
                      className="flex-shrink-0 w-8 h-8 inline-flex items-center justify-center text-xl font-light transition-transform group-open:rotate-45"
                      style={{ color: TERRACOTTA }}
                    >
                      +
                    </div>
                  </summary>
                  <p
                    className="mt-4 text-[15px] leading-[1.7] max-w-[64ch]"
                    style={{ color: INK_SOFT }}
                  >
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── VISIT / LOCATION ─────────────── */}
      <section id="visit" className="py-24 sm:py-32" style={{ background: BG }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <Eyebrow>Find us</Eyebrow>
            <h2
              className="mt-4 font-serif text-[36px] sm:text-[44px] leading-[1.08] tracking-[-0.015em]"
              style={{ color: NAVY_DEEP }}
            >
              A villa on Street 29 &mdash;
              <br />
              behind Box Park, beside City Walk.
            </h2>
            <p
              className="mt-6 text-[16px] leading-[1.7] max-w-[55ch]"
              style={{ color: INK_SOFT }}
            >
              Tucked into one of Al Wasl&rsquo;s quietest residential
              streets &mdash; central enough for an easy school run,
              residential enough for a real garden and a calm street.
              Plenty of parent parking; an easy drop-off lane for the
              morning rush.
            </p>

            <div className="mt-10 space-y-px" style={{ background: `${NAVY}22` }}>
              <div
                className="p-6 sm:p-7 flex items-start gap-5"
                style={{ background: BG }}
              >
                <MapPin
                  size={22}
                  weight="duotone"
                  style={{ color: TERRACOTTA }}
                  className="flex-shrink-0 mt-1"
                />
                <div>
                  <div
                    className="text-[11px] tracking-[0.22em] uppercase mb-1"
                    style={{ color: NAVY_SOFT }}
                  >
                    The nursery
                  </div>
                  <div
                    className="font-serif text-[20px] leading-tight"
                    style={{ color: NAVY_DEEP }}
                  >
                    {BUSINESS.address.line1}
                  </div>
                  <div
                    className="mt-1 text-[14px]"
                    style={{ color: INK_SOFT }}
                  >
                    {BUSINESS.address.line2}
                  </div>
                  <div
                    className="mt-1 text-[14px]"
                    style={{ color: INK_SOFT }}
                  >
                    {BUSINESS.address.city}
                  </div>
                </div>
              </div>
              <div
                className="p-6 sm:p-7 flex items-start gap-5"
                style={{ background: BG }}
              >
                <CalendarBlank
                  size={22}
                  weight="duotone"
                  style={{ color: TERRACOTTA }}
                  className="flex-shrink-0 mt-1"
                />
                <div>
                  <div
                    className="text-[11px] tracking-[0.22em] uppercase mb-1"
                    style={{ color: NAVY_SOFT }}
                  >
                    Tour times
                  </div>
                  <div
                    className="font-serif text-[20px] leading-tight"
                    style={{ color: NAVY_DEEP }}
                  >
                    Sunday &ndash; Thursday, 9am &ndash; 11am
                  </div>
                  <div
                    className="mt-1 text-[14px]"
                    style={{ color: INK_SOFT }}
                  >
                    By appointment &middot; allow 45 minutes
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={PHOTOS.heroEntrance}
                alt="Great Minds Montessori — front entrance, Al Wasl"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── CONTACT FORM ─────────────── */}
      <section
        id="contact"
        className="py-24 sm:py-32"
        style={{ background: BG_DEEP }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-5 space-y-7">
            <Eyebrow>Book a tour, ask a question</Eyebrow>
            <h2
              className="font-serif text-[36px] sm:text-[48px] leading-[1.06] tracking-[-0.015em]"
              style={{ color: NAVY_DEEP }}
            >
              We&rsquo;d love
              <br />
              to meet your family.
            </h2>
            <p
              className="text-[16px] leading-[1.7] max-w-[44ch]"
              style={{ color: INK_SOFT }}
            >
              Use the form for a written reply within one working day.
              For something more urgent &mdash; or simply if you&rsquo;d
              rather speak to a person &mdash; the office line goes
              directly to Ana.
            </p>

            <div className="pt-2 space-y-4">
              <a
                href={BUSINESS.phoneHref}
                className="flex items-center gap-4 group"
              >
                <div
                  className="w-11 h-11 inline-flex items-center justify-center"
                  style={{ background: `${NAVY}10`, color: NAVY }}
                >
                  <Phone size={18} weight="fill" />
                </div>
                <div>
                  <div
                    className="text-[11px] tracking-[0.22em] uppercase"
                    style={{ color: NAVY_SOFT }}
                  >
                    Call the nursery
                  </div>
                  <div
                    className="font-serif text-[20px] leading-tight"
                    style={{ color: NAVY_DEEP }}
                  >
                    {BUSINESS.phoneDisplay}
                  </div>
                </div>
              </a>
              <a
                href={BUSINESS.emailHref}
                className="flex items-center gap-4 group"
              >
                <div
                  className="w-11 h-11 inline-flex items-center justify-center"
                  style={{ background: `${NAVY}10`, color: NAVY }}
                >
                  <Envelope size={18} weight="fill" />
                </div>
                <div>
                  <div
                    className="text-[11px] tracking-[0.22em] uppercase"
                    style={{ color: NAVY_SOFT }}
                  >
                    Email the office
                  </div>
                  <div
                    className="font-serif text-[18px] leading-tight break-all"
                    style={{ color: NAVY_DEEP }}
                  >
                    {BUSINESS.email}
                  </div>
                </div>
              </a>
              <a
                href={BUSINESS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group"
              >
                <div
                  className="w-11 h-11 inline-flex items-center justify-center"
                  style={{ background: `${NAVY}10`, color: NAVY }}
                >
                  <InstagramLogo size={18} weight="fill" />
                </div>
                <div>
                  <div
                    className="text-[11px] tracking-[0.22em] uppercase"
                    style={{ color: NAVY_SOFT }}
                  >
                    Follow our week
                  </div>
                  <div
                    className="font-serif text-[18px] leading-tight"
                    style={{ color: NAVY_DEEP }}
                  >
                    @greatmindsnursery
                  </div>
                </div>
              </a>
            </div>
          </div>

          <div className="lg:col-span-7">
            <InquiryForm
              slug="greatminds-ae"
              accent={NAVY}
              accentDeep={NAVY_DEEP}
              ink={INK}
              inkSoft={INK_SOFT}
              panelBg={PANEL}
              serif="ui-serif, Georgia, Cambria, 'Times New Roman', serif"
              submitLabel="Send my enquiry"
              successHeading="Thank you — your message is with Ana."
              successBody="You'll hear back within one working day with tour availability and the welcome pack. For anything urgent in the meantime, please call the nursery on +971 4 344 5222."
              fields={[
                {
                  type: "text",
                  name: "name",
                  label: "Parent name *",
                  placeholder: "First and last",
                  required: true,
                },
                {
                  type: "email",
                  name: "email",
                  label: "Email *",
                  placeholder: "you@example.com",
                  required: true,
                },
                {
                  type: "tel",
                  name: "phone",
                  label: "Phone (optional)",
                  placeholder: "+971 ...",
                },
                {
                  type: "text",
                  name: "child_name",
                  label: "Child's first name",
                  placeholder: "(or first names if more than one)",
                },
                {
                  type: "select",
                  name: "child_age",
                  label: "Child's current age",
                  options: [
                    { value: "under-1", label: "Under 1 year" },
                    { value: "1-2", label: "1 – 2 years" },
                    { value: "2-3", label: "2 – 3 years" },
                    { value: "3-4", label: "3 – 4 years" },
                    { value: "4-5", label: "4 – 5 years" },
                    { value: "5-6", label: "5 – 6 years" },
                  ],
                },
                {
                  type: "select",
                  name: "start_date",
                  label: "Hoped-for start date",
                  options: [
                    { value: "asap", label: "As soon as possible" },
                    { value: "next-term", label: "Next term" },
                    { value: "next-academic-year", label: "Next academic year" },
                    { value: "exploring", label: "Just exploring for now" },
                  ],
                },
                {
                  type: "radio",
                  name: "interest",
                  label: "What's brought you here?",
                  options: [
                    { value: "tour", label: "Book a tour", description: "We'd like to come and see the nursery" },
                    { value: "places", label: "Check availability", description: "What spaces do you have for our age group?" },
                    { value: "fees", label: "Request the welcome pack", description: "Fees, hours, term dates, the full picture" },
                    { value: "other", label: "Something else", description: "Tell us in the message" },
                  ],
                },
                {
                  type: "textarea",
                  name: "message",
                  label: "Anything you'd like us to know?",
                  placeholder: "Your child's personality, any prior nursery experience, any questions you'd like answered before the tour. As much or as little as feels right.",
                  rows: 5,
                  full: true,
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ─────────────── FOOTER ─────────────── */}
      <footer
        style={{ background: BG_INK, color: BG }}
        className="pt-20 pb-10"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-12 mb-16">
            <div className="lg:col-span-5 space-y-6">
              <img
                src={PHOTOS.logo}
                alt="Great Minds Early Childhood Center"
                className="h-12 w-auto"
              />
              <p
                className="font-serif text-[20px] leading-[1.45] max-w-[36ch]"
                style={{ color: BG }}
              >
                A genuinely unhurried Montessori early childhood &mdash;
                in the heart of Al Wasl, Dubai.
              </p>
              <div className="text-[13px]" style={{ color: "#bdc1cc" }}>
                Member, American Montessori Society &middot; KHDA registered
              </div>
            </div>

            <div className="lg:col-span-2">
              <div
                className="text-[11px] tracking-[0.22em] uppercase mb-5"
                style={{ color: SAND }}
              >
                The nursery
              </div>
              <ul className="space-y-3 text-[14px]" style={{ color: "#cfd0d8" }}>
                <li><a href="#about" className="hover:text-white transition">About</a></li>
                <li><a href="#classes" className="hover:text-white transition">Classes</a></li>
                <li><a href="#curriculum" className="hover:text-white transition">Curriculum</a></li>
                <li><a href="#day" className="hover:text-white transition">A day here</a></li>
                <li><a href="#visit" className="hover:text-white transition">Visit us</a></li>
                <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>

            <div className="lg:col-span-2">
              <div
                className="text-[11px] tracking-[0.22em] uppercase mb-5"
                style={{ color: SAND }}
              >
                Visit
              </div>
              <ul className="space-y-2 text-[14px]" style={{ color: "#cfd0d8" }}>
                <li style={{ color: BG }}>{BUSINESS.address.line1}</li>
                <li>{BUSINESS.address.line2}</li>
                <li>{BUSINESS.address.city}</li>
                <li className="pt-2">Sun &ndash; Thu, 7:30 &ndash; 15:30</li>
                <li>Extended care to 16:30</li>
              </ul>
            </div>

            <div className="lg:col-span-3">
              <div
                className="text-[11px] tracking-[0.22em] uppercase mb-5"
                style={{ color: SAND }}
              >
                Connect
              </div>
              <ul className="space-y-3 text-[14px]" style={{ color: "#cfd0d8" }}>
                <li>
                  <a href={BUSINESS.phoneHref} className="hover:text-white transition">
                    {BUSINESS.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a
                    href={BUSINESS.emailHref}
                    className="hover:text-white transition break-all"
                  >
                    {BUSINESS.email}
                  </a>
                </li>
                <li className="flex items-center gap-3 pt-2">
                  <a
                    href={BUSINESS.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-9 h-9 inline-flex items-center justify-center border border-[#2c3c5a] hover:bg-white/5 transition"
                  >
                    <InstagramLogo size={16} weight="fill" />
                  </a>
                  <a
                    href={BUSINESS.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="w-9 h-9 inline-flex items-center justify-center border border-[#2c3c5a] hover:bg-white/5 transition"
                  >
                    <FacebookLogo size={16} weight="fill" />
                  </a>
                  <a
                    href={BUSINESS.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="w-9 h-9 inline-flex items-center justify-center border border-[#2c3c5a] hover:bg-white/5 transition"
                  >
                    <LinkedinLogo size={16} weight="fill" />
                  </a>
                </li>
                <li className="pt-3">
                  <a
                    href="#visit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-[12px] font-medium tracking-wide transition"
                    style={{ background: TERRACOTTA, color: BG_INK }}
                  >
                    Book a morning tour
                    <ArrowRight size={12} weight="bold" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div
            className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[12px]"
            style={{ borderTop: `1px solid #2c3c5a`, color: "#9aa1b3" }}
          >
            <div>
              &copy; {new Date().getFullYear()} {BUSINESS.name}. All rights
              reserved.
            </div>
            <div>
              Montessori &middot; Al Wasl &middot; Dubai &middot; Children
              aged 1 to 6
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
