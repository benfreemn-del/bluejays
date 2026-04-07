"use client";

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

/* ───────────────────────── SVG Icons ───────────────────────── */

const CrossIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M12 2v20M7 7h10" strokeLinecap="round" />
  </svg>
);

const DoveIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M18 2c-1.5 1-3 2-4 4-1-1-3-2-5-2-3 0-5.5 2.5-5.5 5.5 0 1 .3 2 .7 2.8L2 15l3.5 1 1.5 3.5 3-2.5c.8.3 1.6.5 2.5.5 4 0 7-3.5 7-7 0-1-.2-2-.5-3l3-4.5L18 2z" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12.5" cy="9" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const BibleIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    <path d="M12 6v7M9.5 9.5h5" strokeLinecap="round" />
  </svg>
);

const PrayingHandsIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M12 2C10 6 8 8 8 12c0 2 1 4 2.5 5.5L12 22l1.5-4.5C15 16 16 14 16 12c0-4-2-6-4-10z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 12c-1 0-2 .5-2.5 1.5S5 16 6 17" strokeLinecap="round" />
    <path d="M16 12c1 0 2 .5 2.5 1.5S19 16 18 17" strokeLinecap="round" />
  </svg>
);

const ChurchBuildingIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M12 2l-1 3H5l-2 4v12h18V9l-2-4h-6l-1-3z" strokeLinejoin="round" />
    <path d="M12 5v4M10 7h4" strokeLinecap="round" />
    <path d="M9 21v-5a3 3 0 016 0v5" />
    <circle cx="12" cy="13" r="1.5" />
  </svg>
);

const HeartIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinejoin="round" />
  </svg>
);

const CandleIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M12 2c-.5 2-2 3-2 5 0 1.1.9 2 2 2s2-.9 2-2c0-2-1.5-3-2-5z" fill="currentColor" opacity="0.3" strokeLinejoin="round" />
    <rect x="9" y="10" width="6" height="12" rx="1" />
    <line x1="12" y1="10" x2="12" y2="9" strokeLinecap="round" />
  </svg>
);

const RaysIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" strokeLinecap="round" />
  </svg>
);

const MusicNoteIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const UsersIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const GlobeIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);

const ClockIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PlayIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M8 5v14l11-7z" />
  </svg>
);

const MapPinIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const PhoneIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const MailIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const CheckCircleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const WaterDropIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" strokeLinejoin="round" />
  </svg>
);

const ChildIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <circle cx="12" cy="4.5" r="2.5" />
    <path d="M12 7v5M8 9.5l4 2.5 4-2.5M12 12v5M8 21l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

/* ───────────────────────── Background Patterns ───────────────────────── */

const StainedGlassPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="stainedGlass" width="80" height="80" patternUnits="userSpaceOnUse">
        <path d="M40 0L80 40L40 80L0 40Z" fill="none" stroke="#e2b857" strokeWidth="0.5" />
        <circle cx="40" cy="40" r="15" fill="none" stroke="#e2b857" strokeWidth="0.3" />
        <path d="M40 25v30M25 40h30" stroke="#e2b857" strokeWidth="0.3" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#stainedGlass)" />
  </svg>
);

const CrossPattern = ({ opacity = 0.025 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="crossPat" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M30 10v40M20 25h20" stroke="#e2b857" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#crossPat)" />
  </svg>
);

const RaysPattern = ({ opacity = 0.04 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 800 400" preserveAspectRatio="none">
    {Array.from({ length: 12 }).map((_, i) => (
      <line key={i} x1="400" y1="200" x2={400 + 400 * Math.cos((i * 30 * Math.PI) / 180)} y2={200 + 200 * Math.sin((i * 30 * Math.PI) / 180)} stroke="#e2b857" strokeWidth="0.5" />
    ))}
    <circle cx="400" cy="200" r="60" fill="none" stroke="#e2b857" strokeWidth="0.3" />
    <circle cx="400" cy="200" r="120" fill="none" stroke="#e2b857" strokeWidth="0.2" />
    <circle cx="400" cy="200" r="180" fill="none" stroke="#e2b857" strokeWidth="0.15" />
  </svg>
);

/* ───────────────────────── Data ───────────────────────── */

const serviceTimes = [
  { day: "Sunday Morning Worship", time: "9:00 AM & 11:00 AM", desc: "Traditional and contemporary worship services with a message of hope." },
  { day: "Sunday Evening Service", time: "6:00 PM", desc: "Intimate evening of praise, prayer, and deeper Bible teaching." },
  { day: "Wednesday Bible Study", time: "7:00 PM", desc: "Midweek study through the Scriptures, open to all ages and levels." },
  { day: "Youth Group (Fridays)", time: "6:30 PM", desc: "Fellowship, worship, and Biblical teaching for students grades 6-12." },
];

const beliefs = [
  { title: "The Bible Is God\u2019s Word", desc: "We believe the Bible is the inspired, infallible Word of God and the ultimate authority for faith and life.", icon: <BibleIcon /> },
  { title: "Salvation Through Jesus Christ", desc: "We believe salvation is a free gift of grace received through faith in Jesus Christ, who died for our sins and rose again.", icon: <CrossIcon /> },
  { title: "The Holy Trinity", desc: "We believe in one God eternally existing in three persons: Father, Son, and Holy Spirit, equal in power and glory.", icon: <RaysIcon /> },
  { title: "Baptism & Communion", desc: "We practice baptism by immersion as a public declaration of faith and observe the Lord\u2019s Supper in remembrance of Christ\u2019s sacrifice.", icon: <WaterDropIcon /> },
  { title: "The Power of Prayer", desc: "We believe prayer is our direct line to God and that He hears and answers the prayers of His people.", icon: <PrayingHandsIcon /> },
  { title: "The Church as God\u2019s Family", desc: "We believe the Church is the body of Christ, called to love one another, serve the community, and share the Gospel with all.", icon: <HeartIcon /> },
];

const leadership = [
  {
    name: "Pastor Michael Davis",
    title: "Lead Pastor",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    bio: "Pastor Michael has faithfully served Grace Community Church for over 18 years. His passion for God\u2019s Word and heart for people have been the foundation of our church\u2019s growth and community impact.",
  },
  {
    name: "Pastor Sarah Mitchell",
    title: "Associate Pastor \u2014 Worship & Women\u2019s Ministry",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
    bio: "Pastor Sarah leads our worship ministry with a gifted voice and a deep love for leading people into God\u2019s presence through music and praise.",
  },
  {
    name: "Pastor James Thompson",
    title: "Associate Pastor \u2014 Youth & Outreach",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
    bio: "Pastor James has a heart for the next generation. He leads our youth and outreach programs, connecting young people and the community to the love of Christ.",
  },
];

const ministries = [
  { name: "Worship Ministry", desc: "Choir, praise band, and worship arts leading our congregation in Spirit-filled worship every Sunday.", icon: <MusicNoteIcon /> },
  { name: "Youth Ministry", desc: "Dynamic programs for teens including Bible study, retreats, mission trips, and Friday night fellowship.", icon: <UsersIcon /> },
  { name: "Children\u2019s Ministry", desc: "A safe, fun, and faith-building environment where kids learn about Jesus through stories, crafts, and worship.", icon: <ChildIcon /> },
  { name: "Small Groups", desc: "Home-based groups where members grow deeper in faith, build friendships, and support one another through life.", icon: <HeartIcon /> },
  { name: "Outreach & Missions", desc: "Local community service, food drives, homeless outreach, and global mission partnerships spreading the Gospel.", icon: <GlobeIcon /> },
  { name: "Prayer Ministry", desc: "Dedicated intercessors and weekly prayer gatherings lifting up the needs of our church, city, and world.", icon: <CandleIcon /> },
];

const visitSteps = [
  { title: "What to Expect", desc: "A warm greeting, welcoming atmosphere, uplifting worship music, and a Bible-based message that speaks to your life. Services last about 75 minutes.", icon: <ChurchBuildingIcon /> },
  { title: "What to Wear", desc: "Come as you are! Whether that\u2019s jeans and a T-shirt or your Sunday best, you\u2019ll fit right in. God looks at the heart, not the outfit.", icon: <HeartIcon /> },
  { title: "Where to Park", desc: "Free parking is available in our main lot and overflow lot on Elm Street. Our parking team will help you find a spot and direct you to the entrance.", icon: <MapPinIcon className="w-7 h-7" /> },
  { title: "Kids Are Welcome", desc: "We offer nursery care for infants, and age-appropriate classes for children during both Sunday services. Your kids will love it here!", icon: <ChildIcon /> },
];

const events = [
  { title: "Easter Sunday Celebration", date: "April 20, 2026", time: "9:00 AM & 11:00 AM", desc: "A joyful celebration of the resurrection with special music, baptisms, and a powerful message of hope.", category: "Worship" },
  { title: "Wednesday Night Bible Study", date: "Every Wednesday", time: "7:00 PM", desc: "Currently studying the Book of Romans \u2014 come discover the depth of God\u2019s grace and love.", category: "Study" },
  { title: "Community Dinner & Fellowship", date: "April 25, 2026", time: "5:30 PM", desc: "A free home-cooked meal for the whole community. Bring your family and your neighbors!", category: "Fellowship" },
  { title: "Youth Night: Bonfire & Worship", date: "April 24, 2026", time: "6:30 PM", desc: "An outdoor evening of worship, s\u2019mores, games, and a devotional under the stars.", category: "Youth" },
];

const sermons = [
  { title: "Unshakeable Faith", series: "Standing Firm", date: "March 30, 2026", duration: "42 min", image: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=600&q=80" },
  { title: "The Good Shepherd", series: "Psalm 23", date: "March 23, 2026", duration: "38 min", image: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&q=80" },
  { title: "Grace That Transforms", series: "Amazing Grace", date: "March 16, 2026", duration: "45 min", image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=80" },
];

const galleryImages = [
  { src: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=600&q=80", alt: "Sunday worship" },
  { src: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&q=80", alt: "Community gathering" },
  { src: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=600&q=80", alt: "Baptism celebration" },
  { src: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&q=80", alt: "Fellowship event" },
  { src: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&q=80", alt: "Volunteer outreach" },
  { src: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=600&q=80", alt: "Youth group" },
];

const testimonials = [
  { name: "Jennifer M.", text: "Walking through the doors of Grace Community Church changed my life. I found a family that loved me, prayed for me, and pointed me to Jesus when I needed Him most.", tag: "New Believer" },
  { name: "David & Maria R.", text: "Our marriage was falling apart. Through the love of this church, godly counseling, and a lot of prayer, God restored what was broken. We are forever grateful.", tag: "Marriage Restored" },
  { name: "Marcus T.", text: "I was addicted and hopeless. Pastor Michael and this congregation walked with me through the darkest season of my life. By God\u2019s grace, I\u2019ve been free for three years.", tag: "Set Free" },
];

const faqs = [
  { q: "What denomination is Grace Community Church?", a: "We are a non-denominational, Bible-believing church. Our focus is on the authority of Scripture and a personal relationship with Jesus Christ, not denominational labels." },
  { q: "What do you offer for children?", a: "We have a full children\u2019s ministry with nursery care for infants, toddler rooms, and age-appropriate classes for kids through 5th grade during both Sunday morning services." },
  { q: "How do I become a member?", a: "We offer a membership class called \u2018Next Steps\u2019 on the first Sunday of each month. It covers our beliefs, vision, and how to get connected. You can sign up at the Welcome Center." },
  { q: "Is there a dress code?", a: "Not at all! Come as you are. Some folks wear suits, others wear jeans. What matters to us is that you\u2019re here, not what you\u2019re wearing." },
  { q: "How can I get involved in serving?", a: "We\u2019d love to have you serve! Visit our Welcome Center after any service or fill out the \u2018Get Connected\u2019 form on our website, and our team will help you find the right ministry fit." },
];

/* ───────────────────────── Section Header ───────────────────────── */

function SectionHeader({
  tag,
  title,
  highlightWord,
  subtitle,
  center = true,
}: {
  tag: string;
  title: string;
  highlightWord: string;
  subtitle?: string;
  center?: boolean;
}) {
  const parts = title.split(highlightWord);
  return (
    <div className={`mb-16 ${center ? "text-center" : ""}`}>
      <motion.span
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="inline-block text-[#e2b857] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#e2b857]/20 bg-[#e2b857]/5"
      >
        {tag}
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-3xl md:text-5xl font-extrabold tracking-tight"
      >
        {parts[0]}
        <span className="text-[#e2b857]">{highlightWord}</span>
        {parts[1] || ""}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`h-0.5 w-16 bg-gradient-to-r from-[#e2b857] to-transparent mt-4 ${center ? "mx-auto" : ""}`}
      />
      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-muted mt-4 max-w-2xl text-lg leading-relaxed mx-auto"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

/* ───────────────────────── Main Component ───────────────────────── */

export default function ChurchTemplate() {
  return (
    <TemplateLayout
      businessName="Grace Community Church"
      tagline="A place of faith, family, and fellowship in the heart of Federal Way."
      accentColor="#e2b857"
      accentColorLight="#f0d078"
      heroGradient="linear-gradient(135deg, #1a1510 0%, #0f0d08 100%)"
      heroImage="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1400&q=80"
      phone="(253) 555-0200"
      address="Federal Way, WA"
    >
      {/* ════════════════ 1. Welcome Banner ════════════════ */}
      <section className="py-5 relative overflow-hidden" style={{ background: "linear-gradient(90deg, #1a1510 0%, #2a1f10 50%, #1a1510 100%)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-[#e2b857]/5 via-[#e2b857]/10 to-[#e2b857]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 relative z-10">
          <div className="flex items-center gap-3 text-[#e2b857]">
            <CrossIcon className="w-6 h-6" />
            <p className="text-sm font-bold tracking-wide text-[#f5e6c8]">WELCOME HOME &mdash; ALL ARE WELCOME AT THE TABLE OF THE LORD</p>
            <DoveIcon className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-2 bg-[#e2b857]/10 backdrop-blur-sm px-5 py-2 rounded-full border border-[#e2b857]/20">
            <ClockIcon className="w-4 h-4 text-[#e2b857]" />
            <span className="text-xs font-bold tracking-wider text-[#f5e6c8]">SUNDAYS AT 9 AM & 11 AM</span>
          </div>
        </div>
      </section>

      {/* ════════════════ 2. Service Times ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #1a1510 0%, #1e1812 50%, #1a1510 100%)" }}
      >
        <StainedGlassPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#e2b857]/6" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#e2b857]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="JOIN US IN WORSHIP"
            title="Service Times"
            highlightWord="Times"
            subtitle="We gather throughout the week to worship, learn, and grow together. Come find your place in our church family."
          />
          <div className="grid md:grid-cols-2 gap-6">
            {serviceTimes.map((service, i) => (
              <motion.div
                key={service.day}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl border border-[#e2b857]/10 hover:border-[#e2b857]/30 transition-all duration-500 overflow-hidden bg-[#e2b857]/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#e2b85715,transparent_70%)]" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e2b857]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex items-start gap-5">
                  <div className="w-14 h-14 rounded-xl bg-[#e2b857]/10 border border-[#e2b857]/20 flex items-center justify-center text-[#e2b857] shrink-0 group-hover:bg-[#e2b857]/20 group-hover:border-[#e2b857]/40 transition-all duration-300">
                    <ClockIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 group-hover:text-[#e2b857] transition-colors duration-300">{service.day}</h3>
                    <span className="inline-block text-[#e2b857] text-sm font-semibold mb-2">{service.time}</span>
                    <p className="text-muted text-sm leading-relaxed">{service.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ 3. Statement of Faith ════════════════ */}
      <section
        id="about"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #151008 0%, #1a1510 50%, #151008 100%)" }}
      >
        <CrossPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[180px] bg-[#e2b857]/6" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="WHAT WE BELIEVE"
            title="Our Statement of Faith"
            highlightWord="Faith"
            subtitle="These are the core truths that guide everything we do as a church. We hold firmly to the unchanging Word of God."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {beliefs.map((belief, i) => (
              <motion.div
                key={belief.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl border border-[#e2b857]/[0.08] hover:border-[#e2b857]/30 transition-all duration-500 overflow-hidden bg-[#e2b857]/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#e2b85715,transparent_70%)]" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e2b857]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#e2b857]/10 border border-[#e2b857]/20 flex items-center justify-center text-[#e2b857] group-hover:bg-[#e2b857]/20 group-hover:border-[#e2b857]/40 transition-all duration-300">
                      {belief.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-white/[0.04] group-hover:text-[#e2b857]/10 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-[#e2b857] transition-colors duration-300">{belief.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{belief.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ 4. Pastor / Leadership ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #1a1510 0%, #1e1812 50%, #1a1510 100%)" }}
      >
        <StainedGlassPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px] bg-[#e2b857]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR SHEPHERDS"
            title="Meet Our Pastors"
            highlightWord="Pastors"
            subtitle="Faithful leaders called by God to shepherd, teach, and serve our church family with love and integrity."
          />
          <div className="grid md:grid-cols-3 gap-8">
            {leadership.map((leader, i) => (
              <motion.div
                key={leader.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="group relative rounded-2xl border border-[#e2b857]/[0.08] hover:border-[#e2b857]/30 transition-all duration-500 overflow-hidden bg-[#e2b857]/[0.02]"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={leader.image}
                    alt={leader.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1510] via-[#1a1510]/40 to-transparent" />
                  {i === 0 && (
                    <div className="absolute top-4 right-4 bg-[#e2b857]/90 backdrop-blur-sm text-[#1a1510] text-xs font-bold px-3 py-1.5 rounded-full border border-[#f0d078]/30">
                      LEAD PASTOR
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold mb-1">{leader.name}</h3>
                    <p className="text-[#e2b857] text-sm font-semibold mb-3">{leader.title}</p>
                    <p className="text-white/60 text-sm leading-relaxed">{leader.bio}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ 5. Ministries ════════════════ */}
      <section
        id="services"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #151008 0%, #1a1510 50%, #151008 100%)" }}
      >
        <CrossPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#e2b857]/6" />
          <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#e2b857]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="GET INVOLVED"
            title="Our Ministries"
            highlightWord="Ministries"
            subtitle="From worship to outreach, there is a place for everyone to serve and grow at Grace Community Church."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ministries.map((ministry, i) => (
              <motion.div
                key={ministry.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl border border-[#e2b857]/[0.08] hover:border-[#e2b857]/30 transition-all duration-500 overflow-hidden bg-[#e2b857]/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#e2b85715,transparent_70%)]" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e2b857]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#e2b857]/10 border border-[#e2b857]/20 flex items-center justify-center text-[#e2b857] group-hover:bg-[#e2b857]/20 group-hover:border-[#e2b857]/40 transition-all duration-300">
                      {ministry.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-white/[0.04] group-hover:text-[#e2b857]/10 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-[#e2b857] transition-colors duration-300">{ministry.name}</h3>
                  <p className="text-muted text-sm leading-relaxed">{ministry.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ 6. Plan Your Visit ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #1a1510 0%, #201a12 50%, #1a1510 100%)" }}
      >
        <RaysPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[180px] bg-[#e2b857]/7" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="YOUR FIRST VISIT"
            title="Plan Your Visit"
            highlightWord="Visit"
            subtitle="We want your first time here to feel like coming home. Here is everything you need to know."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visitSteps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group text-center p-7 rounded-2xl border border-[#e2b857]/[0.08] hover:border-[#e2b857]/30 bg-[#e2b857]/[0.02] transition-all duration-500"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-[#e2b857]/10 border border-[#e2b857]/20 flex items-center justify-center text-[#e2b857] mb-5 group-hover:bg-[#e2b857]/20 group-hover:scale-110 transition-all duration-300">
                  {step.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e2b857]/60 mb-2 block">Step {String(i + 1).padStart(2, "0")}</span>
                <h4 className="font-bold mb-2 group-hover:text-[#e2b857] transition-colors duration-300">{step.title}</h4>
                <p className="text-muted text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ 7. Upcoming Events ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #151008 0%, #1a1510 50%, #151008 100%)" }}
      >
        <StainedGlassPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#e2b857]/5" />
          <div className="absolute bottom-[15%] left-[10%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#e2b857]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="WHAT IS HAPPENING"
            title="Upcoming Events"
            highlightWord="Events"
            subtitle="There is always something happening at Grace Community Church. We would love for you to be a part of it."
          />
          <div className="grid md:grid-cols-2 gap-6">
            {events.map((event, i) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl border border-[#e2b857]/[0.08] hover:border-[#e2b857]/30 transition-all duration-500 overflow-hidden bg-[#e2b857]/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#e2b85715,transparent_70%)]" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e2b857]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e2b857]/70 bg-[#e2b857]/8 border border-[#e2b857]/10 px-2.5 py-1 rounded-full">
                      {event.category}
                    </span>
                    <span className="text-muted text-xs">{event.date}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-[#e2b857] transition-colors duration-300">{event.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <ClockIcon className="w-4 h-4 text-[#e2b857]" />
                    <span className="text-[#e2b857] text-sm font-semibold">{event.time}</span>
                  </div>
                  <p className="text-muted text-sm leading-relaxed">{event.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ 8. Sermons / Media ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #1a1510 0%, #1e1812 50%, #1a1510 100%)" }}
      >
        <CrossPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[200px] bg-[#e2b857]/6" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="THE WORD"
            title="Recent Sermons"
            highlightWord="Sermons"
            subtitle="Missed a Sunday? Catch up on our latest messages and let God speak to your heart."
          />
          {/* Featured Sermon */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative rounded-2xl border border-[#e2b857]/[0.08] hover:border-[#e2b857]/30 transition-all duration-500 overflow-hidden bg-[#e2b857]/[0.02] mb-8"
          >
            <div className="grid md:grid-cols-2">
              <div className="relative aspect-video md:aspect-auto overflow-hidden">
                <img src={sermons[0].image} alt={sermons[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-[#e2b857]/90 flex items-center justify-center text-[#1a1510] group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-[#e2b857]/30">
                    <PlayIcon className="w-8 h-8 ml-1" />
                  </div>
                </div>
              </div>
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e2b857]/70 bg-[#e2b857]/8 border border-[#e2b857]/10 px-2.5 py-1 rounded-full self-start mb-4">
                  LATEST MESSAGE
                </span>
                <h3 className="text-2xl font-bold mb-2 group-hover:text-[#e2b857] transition-colors duration-300">{sermons[0].title}</h3>
                <p className="text-[#e2b857] font-semibold mb-2">Series: {sermons[0].series}</p>
                <div className="flex items-center gap-4 text-muted text-sm mb-4">
                  <span>{sermons[0].date}</span>
                  <span>{sermons[0].duration}</span>
                </div>
                <p className="text-muted text-sm leading-relaxed">Pastor Michael Davis explores what it means to have a faith that cannot be shaken, even in the storms of life.</p>
              </div>
            </div>
          </motion.div>
          {/* Past Sermons Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {sermons.slice(1).map((sermon, i) => (
              <motion.div
                key={sermon.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative rounded-2xl border border-[#e2b857]/[0.08] hover:border-[#e2b857]/30 transition-all duration-500 overflow-hidden bg-[#e2b857]/[0.02]"
              >
                <div className="flex items-center gap-5 p-5">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
                    <img src={sermon.image} alt={sermon.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-[#e2b857]/90 flex items-center justify-center text-[#1a1510]">
                        <PlayIcon className="w-4 h-4 ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1 group-hover:text-[#e2b857] transition-colors duration-300">{sermon.title}</h4>
                    <p className="text-[#e2b857] text-sm font-semibold mb-1">Series: {sermon.series}</p>
                    <div className="flex items-center gap-3 text-muted text-xs">
                      <span>{sermon.date}</span>
                      <span>{sermon.duration}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ 9. Community Gallery ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #151008 0%, #1a1510 50%, #151008 100%)" }}
      >
        <RaysPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#e2b857]/5" />
          <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#e2b857]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR FAMILY"
            title="Life at Grace Community"
            highlightWord="Grace Community"
            subtitle="We are more than a church. We are a family united by faith in Jesus Christ. Here are some moments from our journey together."
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#e2b857]/[0.08] hover:border-[#e2b857]/30 transition-all duration-500"
              >
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1510]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <p className="text-white text-sm font-semibold">{img.alt}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ 10. Give / Donation ════════════════ */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#e2b857]/10 to-[#1a1510]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e2b857]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e2b857]/10 to-transparent" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 1000 400">
            <path d="M500 50v300M450 100h100" stroke="#e2b857" strokeWidth="2" opacity="0.3" />
            <circle cx="500" cy="200" r="80" stroke="#e2b857" strokeWidth="0.3" fill="none" />
            <circle cx="500" cy="200" r="150" stroke="#e2b857" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-[#e2b857]/10 border border-[#e2b857]/20 flex items-center justify-center text-[#e2b857] mb-6">
              <HeartIcon className="w-8 h-8" />
            </div>
            <span className="inline-block text-[#e2b857] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#e2b857]/20 bg-[#e2b857]/5">
              GENEROSITY
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">
              Give <span className="text-[#e2b857]">Generously</span>
            </h2>
            <p className="text-muted text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Your generous gifts make it possible to share the Gospel, serve our community, and support families in need. Every gift, no matter the size, makes an eternal impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#e2b857] to-[#d4a843] text-[#1a1510] font-bold items-center justify-center text-lg hover:from-[#f0d078] hover:to-[#e2b857] transition-all duration-300 shadow-lg shadow-[#e2b857]/25 gap-2"
              >
                <HeartIcon className="w-5 h-5" />
                <span>Give Online</span>
              </a>
              <a
                href="#contact"
                className="inline-flex h-14 px-10 rounded-full border-2 border-[#e2b857]/30 text-[#e2b857] font-bold items-center justify-center text-lg hover:bg-[#e2b857]/10 hover:border-[#e2b857]/50 transition-all duration-300 gap-2"
              >
                Learn More
              </a>
            </div>
            <p className="text-muted/60 text-xs mt-6">&ldquo;Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.&rdquo; &mdash; 2 Corinthians 9:7</p>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ 11. Testimonials ════════════════ */}
      <section
        id="testimonials"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #1a1510 0%, #1e1812 50%, #1a1510 100%)" }}
      >
        <StainedGlassPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[40%] w-[600px] h-[400px] rounded-full blur-[180px] bg-[#e2b857]/5" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#e2b857" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#e2b857" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#e2b857" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="CHANGED LIVES"
            title="How God Changed My Life"
            highlightWord="God"
            subtitle="Real stories from real people in our church family whose lives have been transformed by the power of Jesus Christ."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-[#e2b857]/[0.08] hover:border-[#e2b857]/30 transition-all duration-500 overflow-hidden bg-[#e2b857]/[0.02]"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#e2b857]/40 via-[#e2b857]/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#e2b85710,transparent_70%)]" />
                <div className="relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e2b857]/70 bg-[#e2b857]/8 border border-[#e2b857]/10 px-2.5 py-1 rounded-full">
                    {t.tag}
                  </span>
                  <div className="flex items-center gap-0.5 text-[#e2b857] mt-4 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <StarIcon key={j} />
                    ))}
                  </div>
                  <p className="text-muted leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e2b857]/30 to-[#e2b857]/10 flex items-center justify-center text-sm font-bold text-[#e2b857]">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{t.name}</p>
                      <p className="text-muted text-xs">Church Member</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ 12. Connect / Contact ════════════════ */}
      <section
        id="contact"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #151008 0%, #1a1510 50%, #151008 100%)" }}
      >
        <CrossPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[200px] bg-[#e2b857]/6" />
        </div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="REACH OUT"
            title="Connect With Us"
            highlightWord="Connect"
            subtitle="We would love to hear from you. Whether you have a question, a prayer request, or just want to say hello, we are here for you."
          />
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                {[
                  { icon: <MapPinIcon />, label: "Address", value: "1234 Grace Way, Federal Way, WA 98003" },
                  { icon: <PhoneIcon />, label: "Phone", value: "(253) 555-0200" },
                  { icon: <MailIcon />, label: "Email", value: "hello@gracecommunitychurch.org" },
                  { icon: <ClockIcon />, label: "Office Hours", value: "Mon-Fri 9:00 AM - 4:00 PM" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4 p-4 rounded-xl bg-[#e2b857]/[0.02] border border-[#e2b857]/[0.06] hover:border-[#e2b857]/20 transition-colors duration-300">
                    <div className="w-10 h-10 rounded-lg bg-[#e2b857]/10 border border-[#e2b857]/20 flex items-center justify-center text-[#e2b857] shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm mb-0.5">{item.label}</h4>
                      <p className="text-muted text-sm">{item.value}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
              {/* Service times summary */}
              <div className="p-5 rounded-xl bg-[#e2b857]/[0.04] border border-[#e2b857]/[0.1]">
                <h4 className="font-bold text-sm mb-3 text-[#e2b857]">Service Times</h4>
                <div className="space-y-2 text-sm text-muted">
                  <div className="flex justify-between"><span>Sunday Worship</span><span className="text-[#e2b857]">9 AM & 11 AM</span></div>
                  <div className="flex justify-between"><span>Sunday Evening</span><span className="text-[#e2b857]">6:00 PM</span></div>
                  <div className="flex justify-between"><span>Wednesday Bible Study</span><span className="text-[#e2b857]">7:00 PM</span></div>
                  <div className="flex justify-between"><span>Youth Group (Friday)</span><span className="text-[#e2b857]">6:30 PM</span></div>
                </div>
              </div>
            </div>
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl border border-[#e2b857]/20 relative overflow-hidden bg-gradient-to-b from-[#e2b857]/[0.06] to-transparent"
            >
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#e2b85715,transparent_60%)]" />
              <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-[#e2b857]/30 rounded-tl-2xl" />
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-[#e2b857]/30 rounded-br-2xl" />
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Send Us a Message</h3>
                <p className="text-muted text-sm mb-6">We will get back to you within 24 hours.</p>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Your Name"
                      className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#e2b857]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#e2b857]/50 transition-colors"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#e2b857]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#e2b857]/50 transition-colors"
                    />
                  </div>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#e2b857]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#e2b857]/50 transition-colors"
                  />
                  <textarea
                    placeholder="How can we help you? Share a prayer request, question, or just say hello..."
                    rows={4}
                    className="w-full px-5 py-4 rounded-xl bg-white/5 border border-[#e2b857]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#e2b857]/50 resize-none transition-colors"
                  />
                  <button
                    type="button"
                    className="w-full h-14 rounded-xl bg-gradient-to-r from-[#e2b857] to-[#d4a843] text-[#1a1510] font-bold text-lg hover:from-[#f0d078] hover:to-[#e2b857] transition-all duration-300 shadow-lg shadow-[#e2b857]/20"
                  >
                    Send Message
                  </button>
                  <p className="text-center text-white/30 text-xs">
                    Your message is confidential and will be read by our pastoral team.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════ 13. FAQ ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #1a1510 0%, #1e1812 50%, #1a1510 100%)" }}
      >
        <StainedGlassPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#e2b857]/5" />
          <div className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] rounded-full blur-[120px] bg-[#e2b857]/4" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="COMMON QUESTIONS"
            title="Frequently Asked Questions"
            highlightWord="Questions"
          />
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="group p-6 rounded-2xl border border-[#e2b857]/[0.08] hover:border-[#e2b857]/20 transition-all duration-500 overflow-hidden relative bg-[#e2b857]/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_50%,#e2b85710,transparent_70%)]" />
                <div className="relative z-10 flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-[#e2b857]/10 border border-[#e2b857]/20 flex items-center justify-center text-[#e2b857] text-xs font-bold mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-white group-hover:text-[#e2b857] transition-colors duration-300">{faq.q}</h3>
                    <p className="text-muted text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ 14. Final CTA — "Come As You Are" ════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#e2b857]/10 via-[#e2b857]/5 to-[#1a1510]" />
        <RaysPattern opacity={0.04} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e2b857]/30 to-transparent" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[180px] bg-[#e2b857]/8" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-[#e2b857]/10 border border-[#e2b857]/20 flex items-center justify-center text-[#e2b857] mb-6">
              <CrossIcon className="w-8 h-8" />
            </div>
            <span className="inline-block text-[#e2b857] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#e2b857]/20 bg-[#e2b857]/5">
              AN OPEN INVITATION
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Come As <span className="text-[#e2b857]">You Are</span>
            </h2>
            <p className="text-muted text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              You do not have to have it all together. You do not have to be perfect. You just have to come. There is a seat saved for you, a family waiting for you, and a God who loves you more than you know.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#e2b857] to-[#d4a843] text-[#1a1510] font-bold items-center justify-center text-lg hover:from-[#f0d078] hover:to-[#e2b857] transition-all duration-300 shadow-lg shadow-[#e2b857]/25 gap-2"
              >
                <span>Plan Your Visit</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="tel:2535550200"
                className="inline-flex h-14 px-10 rounded-full border-2 border-[#e2b857]/30 text-[#e2b857] font-bold items-center justify-center text-lg hover:bg-[#e2b857]/10 hover:border-[#e2b857]/50 transition-all duration-300 gap-2"
              >
                <PhoneIcon />
                <span>Join Us Sunday</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </TemplateLayout>
  );
}
