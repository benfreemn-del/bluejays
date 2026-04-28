/**
 * LCAC Events Data
 * Edit via the admin panel at /pages/admin.html
 * or update this file directly and redeploy.
 *
 * Field reference:
 *   id          - unique slug (no spaces)
 *   title       - event name
 *   date        - ISO date string "YYYY-MM-DD" (used for past/upcoming logic)
 *   endDate     - optional ISO date for multi-day events "YYYY-MM-DD"
 *   time        - display string e.g. "5:30 PM – 8:00 PM"
 *   location    - venue name and/or address
 *   description - 1-3 sentence summary shown on card
 *   category    - "meeting" | "group" | "fundraiser" | "program" | "workshop"
 *   rsvpRequired  - true/false — shows RSVP form on card
 *   videoUrl    - YouTube or Facebook video URL (empty string = no embed)
 *   pdfUrl      - path to PDF flyer under assets/flyers/ (empty = no download link)
 *   active      - false hides the event entirely (without deleting it)
 */
var LCAC_EVENTS = [
  {
    id: "coalition-meeting-apr",
    title: "Coalition Meeting",
    date: "2026-04-22",
    endDate: "",
    time: "5:30 PM – 8:00 PM",
    location: "S&D Center — 375 Linhart Ave NE Suite B, Napavine",
    description: "Monthly coalition meeting open to all members, families, and community partners. A great opportunity to connect, share updates, and collaborate on upcoming initiatives.",
    category: "meeting",
    rsvpRequired: false,
    videoUrl: "",
    pdfUrl: "",
    active: true
  },
  {
    id: "parent-empowerment-series",
    title: "Parent Empowerment Series",
    date: "2026-04-22",
    endDate: "2026-05-27",
    time: "5:30 PM – 7:00 PM",
    location: "S&D Center — 375 Linhart Ave NE Suite B, Napavine (online option available)",
    description: "A multi-week series designed to support and empower parents of neurodiverse children. Topics include advocacy, self-care, and building community connections.",
    category: "program",
    rsvpRequired: true,
    videoUrl: "",
    pdfUrl: "",
    active: true
  },
  {
    id: "teen-connections-apr",
    title: "Teen Neurodiverse Connections Group",
    date: "2026-04-24",
    endDate: "",
    time: "4:00 PM – 5:00 PM",
    location: "Salkum Library",
    description: "A welcoming space for neurodiverse teens to connect, make friends, and participate in fun activities in a supportive environment.",
    category: "group",
    rsvpRequired: true,
    videoUrl: "",
    pdfUrl: "",
    active: true
  },
  {
    id: "adult-connections-apr",
    title: "Adult Neurodiverse Connections Group",
    date: "2026-04-25",
    endDate: "",
    time: "12:00 PM – 1:00 PM",
    location: "S&D Center — 375 Linhart Ave NE Suite B, Napavine",
    description: "A monthly social group for neurodiverse adults to meet, connect, and enjoy community activities in a comfortable and inclusive setting.",
    category: "group",
    rsvpRequired: true,
    videoUrl: "",
    pdfUrl: "",
    active: true
  },
  {
    id: "art-with-krystian-may",
    title: "Art with Krystian",
    date: "2026-05-02",
    endDate: "",
    time: "5:30 PM – 7:00 PM",
    location: "S&D Center — 375 Linhart Ave NE Suite B, Napavine",
    description: "A creative art session led by Krystian for neurodiverse individuals of all ages. All materials provided. Come ready to create!",
    category: "program",
    rsvpRequired: true,
    videoUrl: "",
    pdfUrl: "",
    active: true
  },
  {
    id: "teen-connections-may",
    title: "May Teen Group Collaboration",
    date: "2026-05-29",
    endDate: "",
    time: "4:00 PM – 5:00 PM",
    location: "Salkum Library",
    description: "May session of the Teen Neurodiverse Connections Group. A fun and supportive space for neurodiverse teens to hang out and collaborate.",
    category: "group",
    rsvpRequired: true,
    videoUrl: "",
    pdfUrl: "",
    active: true
  },
  {
    id: "adult-connections-may",
    title: "May Adult Group Collaboration",
    date: "2026-05-30",
    endDate: "",
    time: "12:00 PM – 1:00 PM",
    location: "S&D Center — 375 Linhart Ave NE Suite B, Napavine",
    description: "May session of the Adult Neurodiverse Connections Group. All are welcome to join for connection, conversation, and community.",
    category: "group",
    rsvpRequired: true,
    videoUrl: "",
    pdfUrl: "",
    active: true
  },
  {
    id: "car-bmx-show-2026",
    title: "3rd Annual Car & BMX Show FUNdraiser",
    date: "2026-06-13",
    endDate: "",
    time: "9:00 AM – 1:00 PM",
    location: "Chehalis Veterans Memorial Museum, Chehalis, WA",
    description: "Our biggest community fundraiser of the year! Come enjoy an incredible show of cars and BMX while supporting autism awareness and inclusion. All proceeds benefit LCAC programs and services.",
    category: "fundraiser",
    rsvpRequired: false,
    videoUrl: "",
    pdfUrl: "",
    active: true
  }
];

// Make available as module export for admin page
if (typeof module !== 'undefined') { module.exports = LCAC_EVENTS; }
