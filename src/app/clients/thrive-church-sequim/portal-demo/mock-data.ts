/**
 * Thrive Church portal-demo mock data
 * ────────────────────────────────────
 * Realistic-feeling seed data for the showcase backend. Names + scenarios
 * are invented but plausible for a ~150-person Pacific NW church.
 * Pastor David Lyke is the real lead pastor at Thrive Sequim per public
 * AG.org directory — used for realism. All other names are fictional.
 *
 * NO real PII. NO live API hits. Pure mock for the sales-call demo.
 */

export type InboxType =
  | "connect"
  | "prayer"
  | "volunteer"
  | "verse"
  | "preschool";

export type InboxStatus = "new" | "in-progress" | "replied" | "closed";

export type InboxItem = {
  id: string;
  type: InboxType;
  name: string;
  email?: string;
  phone?: string;
  receivedAt: string; // ISO-ish
  status: InboxStatus;
  preview: string;
  meta?: Record<string, string>;
};

export const INBOX: InboxItem[] = [
  {
    id: "inb_001",
    type: "connect",
    name: "Sarah Whitlock",
    email: "sarah.whitlock@gmail.com",
    receivedAt: "today · 9:14 am",
    status: "new",
    preview:
      "First Sunday last week — really moved by the message. Would love to connect with a small group near downtown Sequim.",
    meta: { "When were you here": "First Sunday", "Bringing kids": "Yes — elementary age" },
  },
  {
    id: "inb_002",
    type: "prayer",
    name: "Anonymous",
    receivedAt: "today · 8:42 am",
    status: "new",
    preview:
      "Please pray for my mom — biopsy results come back Friday. Family is scared.",
    meta: { Private: "Yes — pastoral team only", "Follow-up OK": "No" },
  },
  {
    id: "inb_003",
    type: "volunteer",
    name: "Mike Aldridge",
    email: "mike.aldridge@outlook.com",
    phone: "(360) 555-0188",
    receivedAt: "today · 7:30 am",
    status: "new",
    preview:
      "Quiz match: Next Wave Kids. Sunday mornings, kids-focused, monthly commitment. Has past experience teaching K-2 Sunday school.",
    meta: { "Top fit": "Next Wave Kids", "Availability": "Sunday mornings" },
  },
  {
    id: "inb_004",
    type: "verse",
    name: "Hannah Petrov",
    email: "hannahp@hotmail.com",
    receivedAt: "yesterday · 9:47 pm",
    status: "new",
    preview: "Subscribed to Verse of the Week (Monday morning email).",
  },
  {
    id: "inb_005",
    type: "preschool",
    name: "Emma Bashioum (parent of Lily, age 4)",
    email: "emma.b@yahoo.com",
    phone: "(360) 555-0144",
    receivedAt: "yesterday · 4:22 pm",
    status: "in-progress",
    preview:
      "Interested in 2026/2027 enrollment. Lily turns 5 in November — wants to confirm cohort. Toured last Tuesday.",
    meta: { Stage: "Tour complete — awaiting deposit" },
  },
  {
    id: "inb_006",
    type: "connect",
    name: "James & Carol McKinney",
    email: "mckinney.family@frontier.com",
    receivedAt: "yesterday · 11:08 am",
    status: "replied",
    preview:
      "Visited 3 Sundays in a row. Ready to find a Thrive Group and learn about baptism. Pastor Dave called Mon.",
    meta: { "What's next": "Baptism conversation + small group" },
  },
  {
    id: "inb_007",
    type: "volunteer",
    name: "Jordan Hsu",
    email: "j.hsu@gmail.com",
    receivedAt: "Mon · 2:14 pm",
    status: "replied",
    preview:
      "Quiz match: Worship & Tech. Has FOH sound experience at previous church. Brian (worship pastor) followed up.",
    meta: { "Top fit": "Worship & Tech", "Status": "Trial Sunday Sep 8" },
  },
  {
    id: "inb_008",
    type: "prayer",
    name: "Tom Reilly",
    email: "treilly56@gmail.com",
    receivedAt: "Mon · 10:01 am",
    status: "replied",
    preview:
      "30 days sober. Praising God + asking prayer for the long road. Janet from the prayer team called.",
    meta: { "Private": "No — wants to share at Sunday", "Follow-up OK": "Yes" },
  },
  {
    id: "inb_009",
    type: "verse",
    name: "Beatrice Lin",
    email: "blin.author@gmail.com",
    receivedAt: "Mon · 9:15 am",
    status: "closed",
    preview: "Subscribed to Verse of the Week.",
  },
  {
    id: "inb_010",
    type: "connect",
    name: "Dakota Reyes",
    email: "dakota.reyes@protonmail.com",
    receivedAt: "Sun · 7:48 pm",
    status: "in-progress",
    preview:
      "Saw the live stream from Port Angeles. Not sure when next move-back is — wants to be on the weekly email list.",
    meta: { "Heard about us": "Online search", "Location": "Port Angeles" },
  },
  {
    id: "inb_011",
    type: "preschool",
    name: "Marco & Jen Petrillo (parent of Theo, age 3)",
    email: "petrillo.family@gmail.com",
    receivedAt: "Sun · 3:12 pm",
    status: "new",
    preview:
      "New to Sequim — looking for preschool starting January. Brought up by neighbor. Free Tues/Thurs?",
    meta: { Stage: "Inquiry — tour to schedule" },
  },
  {
    id: "inb_012",
    type: "volunteer",
    name: "Pastor Tim Wassell (Sequim Comm. Church)",
    email: "twassell@sequimcomm.org",
    receivedAt: "Sat · 5:30 pm",
    status: "new",
    preview:
      "Following up on the Table of Grace partnership conversation. Can our deacons cover the 2nd Thursday next month?",
    meta: { Type: "Partner ministry — Table of Grace" },
  },
];

/* ─────────────────────────  MEMBERS  ─────────────────────────── */

export type Member = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  household: string;
  role: string;
  groups: string[];
  joined: string;
  serving?: string[];
  notes?: string;
};

export const MEMBERS: Member[] = [
  { id: "m_001", name: "David & Karen Lyke", email: "pastor@thrivesequim.com", phone: "(360) 683-7981", household: "Lyke", role: "Lead Pastor + Spouse", groups: ["Leadership"], joined: "2014", serving: ["Sunday teaching", "Prayer team"] },
  { id: "m_002", name: "Brian Ostrander", email: "brian@thrivesequim.com", phone: "(360) 555-0102", household: "Ostrander", role: "Worship Pastor", groups: ["Leadership"], joined: "2017", serving: ["Worship", "Tech"] },
  { id: "m_003", name: "Megan Caruso", email: "megan@thrivesequim.com", phone: "(360) 555-0103", household: "Caruso", role: "Next Wave Director", groups: ["Leadership"], joined: "2019", serving: ["Kids", "Youth"] },
  { id: "m_004", name: "Dottie Halverson", email: "office@thrivesequim.com", phone: "(360) 683-7981", household: "Halverson", role: "Office Manager", groups: ["Staff"], joined: "2016", serving: ["Hospitality"] },
  { id: "m_005", name: "Janet Mukamuri", email: "janet.muka@gmail.com", phone: "(360) 555-0118", household: "Mukamuri", role: "Member", groups: ["Tuesday Women's"], joined: "2020", serving: ["Prayer team lead"] },
  { id: "m_006", name: "Hector & Anita Romero", email: "hectorromero@gmail.com", phone: "(360) 555-0151", household: "Romero", role: "Group Leader", groups: ["Romero Home Group"], joined: "2018", serving: ["Hospitality", "Table of Grace"] },
  { id: "m_007", name: "Cliff & June Yamamoto", email: "yamamoto.family@frontier.com", phone: "(360) 555-0142", household: "Yamamoto", role: "Group Leader", groups: ["Empty Nesters"], joined: "2015" },
  { id: "m_008", name: "Stephen Boone", email: "steve.boone@outlook.com", phone: "(360) 555-0166", household: "Boone", role: "Elder", groups: ["Leadership", "Men's Wed AM"], joined: "2013" },
  { id: "m_009", name: "Naomi Greaves", email: "naomig@gmail.com", phone: "(360) 555-0177", household: "Greaves", role: "Member", groups: ["Wed Young Adults"], joined: "2022", serving: ["Worship vocals"] },
  { id: "m_010", name: "James & Carol McKinney", email: "mckinney.family@frontier.com", phone: "(360) 555-0114", household: "McKinney", role: "New — discipleship", groups: [], joined: "2026-05", notes: "Considering baptism. Pastor Dave following up." },
  { id: "m_011", name: "Reuben Atebe", email: "reuben.atebe@gmail.com", phone: "(360) 555-0125", household: "Atebe", role: "Member", groups: ["Romero Home Group"], joined: "2024", serving: ["Setup team"] },
  { id: "m_012", name: "Bonnie Wexler", email: "bwexler@hotmail.com", phone: "(360) 555-0139", household: "Wexler", role: "Member", groups: ["Tuesday Women's"], joined: "2021", serving: ["Coffee team"] },
];

/* ─────────────────────────  GROUPS  ─────────────────────────── */

export type Group = {
  id: string;
  name: string;
  leaders: string;
  day: string;
  time: string;
  location: string;
  capacity: number;
  current: number;
  audience: string;
  status: "open" | "closed" | "waitlist";
};

export const GROUPS: Group[] = [
  { id: "g_001", name: "Romero Home Group", leaders: "Hector & Anita Romero", day: "Wednesday", time: "6:30 pm", location: "Sequim — N 5th Ave", capacity: 14, current: 11, audience: "Mixed adults", status: "open" },
  { id: "g_002", name: "Empty Nesters", leaders: "Cliff & June Yamamoto", day: "Thursday", time: "7:00 pm", location: "Carlsborg", capacity: 12, current: 12, audience: "55+", status: "closed" },
  { id: "g_003", name: "Tuesday Women's", leaders: "Janet Mukamuri", day: "Tuesday", time: "10:00 am", location: "Church · Room B", capacity: 16, current: 13, audience: "Women", status: "open" },
  { id: "g_004", name: "Men's Wed AM", leaders: "Stephen Boone", day: "Wednesday", time: "6:30 am", location: "First Street Café", capacity: 10, current: 8, audience: "Men", status: "open" },
  { id: "g_005", name: "Wed Young Adults", leaders: "Naomi Greaves + Sam Kessler", day: "Wednesday", time: "7:00 pm", location: "Greaves home — Port Angeles", capacity: 15, current: 14, audience: "20s/30s", status: "open" },
  { id: "g_006", name: "Marriage Together", leaders: "Brad & Maya Lin", day: "Friday", time: "6:30 pm", location: "Lin home — Diamond Point", capacity: 8, current: 8, audience: "Couples", status: "waitlist" },
  { id: "g_007", name: "Saturday Hike + Bible", leaders: "Rotating", day: "Saturday", time: "8:00 am", location: "Trailhead varies", capacity: 20, current: 9, audience: "All", status: "open" },
  { id: "g_008", name: "New to Thrive", leaders: "Pastor Dave + Karen", day: "Sunday", time: "After service", location: "Church · Fellowship Hall", capacity: 25, current: 6, audience: "First 3 months", status: "open" },
];

/* ─────────────────────────  PRESCHOOL  ─────────────────────────── */

export type PreschoolStudent = {
  id: string;
  childName: string;
  age: number;
  parent: string;
  status: "enrolled" | "tour-scheduled" | "waitlist" | "deposit-pending" | "inquired";
  schedule: "M/W/F" | "T/Th" | "5-day";
  tuitionPaid?: string;
  notes?: string;
};

export const PRESCHOOL: PreschoolStudent[] = [
  { id: "p_001", childName: "Aria Holm", age: 4, parent: "Lisa Holm", status: "enrolled", schedule: "M/W/F", tuitionPaid: "Through Dec" },
  { id: "p_002", childName: "Theo Lyke", age: 3, parent: "Pastor Dave + Karen Lyke", status: "enrolled", schedule: "T/Th", tuitionPaid: "Through Dec" },
  { id: "p_003", childName: "Marcus Boone", age: 5, parent: "Stephen & Allison Boone", status: "enrolled", schedule: "5-day", tuitionPaid: "Through Jun" },
  { id: "p_004", childName: "Sophia Mukamuri", age: 4, parent: "Janet Mukamuri", status: "enrolled", schedule: "M/W/F", tuitionPaid: "Through Oct" },
  { id: "p_005", childName: "Lily Bashioum", age: 4, parent: "Emma Bashioum", status: "deposit-pending", schedule: "M/W/F", notes: "Tour complete. Awaiting $200 deposit." },
  { id: "p_006", childName: "Theo Petrillo", age: 3, parent: "Marco & Jen Petrillo", status: "tour-scheduled", schedule: "T/Th", notes: "Tour Wed 5/29 at 10am." },
  { id: "p_007", childName: "Ezra Yang", age: 4, parent: "Susan Yang", status: "waitlist", schedule: "M/W/F", notes: "Waitlist position 1." },
  { id: "p_008", childName: "Mila Atebe", age: 3, parent: "Reuben & Tobi Atebe", status: "waitlist", schedule: "T/Th", notes: "Waitlist position 2." },
  { id: "p_009", childName: "Caleb Greaves", age: 5, parent: "Naomi Greaves", status: "inquired", schedule: "5-day", notes: "Initial email Tue." },
];

/* ─────────────────────────  SERMONS  ─────────────────────────── */

export type Sermon = {
  id: string;
  title: string;
  series: string;
  scripture: string;
  speaker: string;
  date: string;
  durationMin: number;
  youtubeViews: number;
  status: "live" | "archived" | "draft";
};

export const SERMONS: Sermon[] = [
  { id: "s_001", title: "What Does It Mean to Gather?", series: "We Are Thrive", scripture: "Acts 2:42-47", speaker: "Pastor Dave Lyke", date: "May 12, 2026", durationMin: 38, youtubeViews: 412, status: "live" },
  { id: "s_002", title: "Imperfect People, Real Church", series: "We Are Thrive", scripture: "1 Corinthians 1:26-31", speaker: "Pastor Dave Lyke", date: "May 5, 2026", durationMin: 35, youtubeViews: 587, status: "archived" },
  { id: "s_003", title: "On The Mission With Jesus", series: "We Are Thrive", scripture: "Matthew 28:16-20", speaker: "Pastor Dave Lyke", date: "Apr 28, 2026", durationMin: 41, youtubeViews: 692, status: "archived" },
  { id: "s_004", title: "Hope For the Olympic Peninsula", series: "We Are Thrive", scripture: "Romans 15:13", speaker: "Pastor Dave Lyke", date: "Apr 21, 2026", durationMin: 36, youtubeViews: 778, status: "archived" },
  { id: "s_005", title: "Resurrection Sunday", series: "Easter 2026", scripture: "John 20:1-18", speaker: "Pastor Dave Lyke", date: "Apr 14, 2026 (Easter)", durationMin: 44, youtubeViews: 1248, status: "archived" },
  { id: "s_006", title: "The Garden + The Cross", series: "Easter 2026", scripture: "Luke 22:39-46", speaker: "Pastor Dave Lyke", date: "Apr 7, 2026 (Good Friday)", durationMin: 32, youtubeViews: 561, status: "archived" },
  { id: "s_007", title: "When Faith Hurts", series: "Hard Questions", scripture: "Psalm 13", speaker: "Guest: Pastor Tim Wassell", date: "Mar 31, 2026", durationMin: 39, youtubeViews: 503, status: "archived" },
  { id: "s_008", title: "Doubt + Discipleship", series: "Hard Questions", scripture: "Mark 9:14-29", speaker: "Pastor Dave Lyke", date: "Mar 24, 2026", durationMin: 37, youtubeViews: 489, status: "archived" },
  { id: "s_009", title: "Praying When Stuck", series: "Hard Questions", scripture: "Matthew 6:5-15", speaker: "Pastor Dave Lyke", date: "Mar 17, 2026", durationMin: 35, youtubeViews: 534, status: "archived" },
  { id: "s_010", title: "Mother's Day Mini (upcoming)", series: "Special", scripture: "Proverbs 31", speaker: "Pastor Dave Lyke", date: "May 19, 2026", durationMin: 30, youtubeViews: 0, status: "draft" },
];

/* ─────────────────────────  GIVING  ─────────────────────────── */

export type Gift = {
  id: string;
  date: string;
  donor: string;
  amount: number;
  fund: "General" | "Missions" | "Preschool" | "Table of Grace" | "Building";
  recurring: boolean;
  method: "Online" | "Cash" | "Check" | "Stock";
};

export const RECENT_GIFTS: Gift[] = [
  { id: "gf_001", date: "today", donor: "Cliff & June Yamamoto", amount: 250, fund: "General", recurring: true, method: "Online" },
  { id: "gf_002", date: "today", donor: "Anonymous", amount: 50, fund: "Table of Grace", recurring: false, method: "Online" },
  { id: "gf_003", date: "yesterday", donor: "Stephen Boone", amount: 500, fund: "Missions", recurring: false, method: "Check" },
  { id: "gf_004", date: "yesterday", donor: "Janet Mukamuri", amount: 100, fund: "General", recurring: true, method: "Online" },
  { id: "gf_005", date: "Mon", donor: "Brad & Maya Lin", amount: 1000, fund: "Building", recurring: false, method: "Online" },
  { id: "gf_006", date: "Mon", donor: "Naomi Greaves", amount: 40, fund: "General", recurring: true, method: "Online" },
  { id: "gf_007", date: "Sun", donor: "Reuben & Tobi Atebe", amount: 75, fund: "Preschool", recurring: false, method: "Online" },
  { id: "gf_008", date: "Sun", donor: "Hector & Anita Romero", amount: 200, fund: "General", recurring: true, method: "Online" },
  { id: "gf_009", date: "Sun", donor: "Bonnie Wexler", amount: 30, fund: "General", recurring: true, method: "Cash" },
  { id: "gf_010", date: "Sat", donor: "Anonymous", amount: 2500, fund: "Missions", recurring: false, method: "Stock" },
];

export const GIVING_STATS = {
  thisWeek: 4745,
  thisMonth: 18420,
  thisYear: 247380,
  yearGoal: 425000,
  recurringDonors: 47,
  newDonorsThisMonth: 6,
  averageGift: 152,
  largestGift: { donor: "Anonymous", amount: 2500, fund: "Missions" },
};

/* ─────────────────────────  OVERVIEW STATS  ─────────────────────────── */

export const WEEK_STATS = {
  sundayAttendance: 168,
  attendanceTrend: "+12",
  newConnects: 4,
  prayerRequests: 7,
  volunteerSignups: 3,
  verseSubscribers: 8,
  totalVerseSubscribers: 184,
  preschoolInquiries: 2,
  givingThisWeek: 4745,
  givingLastWeek: 4210,
};
