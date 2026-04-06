import type { Prospect, ScrapedData, Category } from "./types";

interface MockBusiness {
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  category: Category;
  currentWebsite?: string;
  googleRating: number;
  reviewCount: number;
  scrapedData: ScrapedData;
}

const mockBusinesses: MockBusiness[] = [
  // REAL ESTATE
  {
    businessName: "Horizon Realty Group",
    ownerName: "Mark Henderson",
    phone: "(512) 555-0142",
    email: "mark@horizonrealty.example.com",
    address: "4201 S Congress Ave",
    category: "real-estate",
    currentWebsite: "http://horizonrealty.example.com",
    googleRating: 4.7,
    reviewCount: 89,
    scrapedData: {
      businessName: "Horizon Realty Group",
      tagline: "Your trusted partner in Austin real estate since 2008.",
      phone: "(512) 555-0142",
      address: "4201 S Congress Ave, Austin, TX",
      about: "With over 15 years serving the Austin metro area, Horizon Realty Group has helped more than 600 families find their dream homes. We specialize in residential sales, luxury properties, and first-time buyer programs.",
      services: [
        { name: "Residential Sales", description: "Full-service buying and selling for single-family homes and condos." },
        { name: "Luxury Properties", description: "Exclusive listings in Austin's premier neighborhoods." },
        { name: "First-Time Buyers", description: "Guidance and financing assistance for first-time homebuyers." },
        { name: "Investment Properties", description: "Help finding and managing rental and investment properties." },
        { name: "Market Analysis", description: "Comprehensive market reports and property valuations." },
        { name: "Relocation Services", description: "Helping families relocating to the Austin area find their perfect home." },
      ],
      testimonials: [
        { name: "Jennifer & Tom K.", text: "Mark and his team found us our dream home in Westlake Hills. The process was seamless from start to finish.", rating: 5 },
        { name: "David R.", text: "Sold my condo in just 10 days, above asking price. Horizon really knows the Austin market.", rating: 5 },
        { name: "Samantha L.", text: "As a first-time buyer, I was nervous about everything. They walked me through every step. Couldn't be happier!", rating: 5 },
      ],
      photos: [],
      hours: "Mon-Fri 9am-6pm, Sat 10am-4pm",
      socialLinks: { facebook: "https://facebook.com/horizonrealty", instagram: "https://instagram.com/horizonrealty" },
    },
  },
  {
    businessName: "Lakeway Premier Properties",
    ownerName: "Susan Chen",
    phone: "(512) 555-0198",
    email: "susan@lakewaypremier.example.com",
    address: "1200 Lakeway Dr",
    category: "real-estate",
    googleRating: 4.9,
    reviewCount: 145,
    scrapedData: {
      businessName: "Lakeway Premier Properties",
      tagline: "Luxury lakefront living, expertly delivered.",
      phone: "(512) 555-0198",
      address: "1200 Lakeway Dr, Lakeway, TX",
      about: "Specializing in luxury waterfront properties around Lake Travis. Susan Chen has been the top-producing agent in the Lakeway area for 8 consecutive years.",
      services: [
        { name: "Waterfront Homes", description: "Exclusive lakefront and lake-view properties on Lake Travis." },
        { name: "Luxury Estates", description: "High-end homes starting at $1M+ in gated communities." },
        { name: "Buyer Representation", description: "Dedicated advocacy through every step of your purchase." },
        { name: "Seller Marketing", description: "Professional photography, staging, and targeted marketing campaigns." },
      ],
      testimonials: [
        { name: "Robert & Marie W.", text: "Susan found us the perfect lakefront property. Her knowledge of the area is unmatched.", rating: 5 },
        { name: "James T.", text: "The marketing she did for our listing was incredible. Professional photos, drone footage, the works.", rating: 5 },
        { name: "Angela P.", text: "We relocated from California and Susan made the whole process stress-free. Love our new lake house!", rating: 5 },
      ],
      photos: [],
      hours: "Mon-Sat 9am-7pm",
    },
  },

  // DENTAL
  {
    businessName: "Austin Family Dentistry",
    ownerName: "Dr. Rachel Kim",
    phone: "(512) 555-0234",
    email: "info@austinfamilydentistry.example.com",
    address: "8500 Burnet Rd, Suite 200",
    category: "dental",
    currentWebsite: "http://austinfamilydentistry.example.com",
    googleRating: 4.8,
    reviewCount: 210,
    scrapedData: {
      businessName: "Austin Family Dentistry",
      tagline: "Gentle, modern dental care for the whole family.",
      phone: "(512) 555-0234",
      address: "8500 Burnet Rd, Suite 200, Austin, TX",
      about: "Dr. Rachel Kim and her team provide comprehensive dental care in a comfortable, state-of-the-art facility. We treat patients of all ages and accept most major insurance plans.",
      services: [
        { name: "General Dentistry", description: "Cleanings, exams, fillings, and preventive care." },
        { name: "Cosmetic Dentistry", description: "Whitening, veneers, and smile makeovers." },
        { name: "Invisalign", description: "Clear aligners for teens and adults.", price: "Starting at $3,500" },
        { name: "Dental Implants", description: "Permanent tooth replacement with natural-looking results." },
        { name: "Pediatric Dentistry", description: "Fun, gentle dental care for kids ages 1-17." },
        { name: "Emergency Care", description: "Same-day appointments for dental emergencies." },
      ],
      testimonials: [
        { name: "Michelle S.", text: "Dr. Kim is amazing! My kids actually look forward to their dental visits now.", rating: 5 },
        { name: "Carlos G.", text: "Got my Invisalign here and the results are incredible. The whole team is so professional.", rating: 5 },
        { name: "Patricia H.", text: "Best dental experience I've ever had. Clean office, friendly staff, no pain.", rating: 5 },
      ],
      photos: [],
      hours: "Mon-Thu 8am-5pm, Fri 8am-2pm",
    },
  },
  {
    businessName: "Smile Solutions TX",
    ownerName: "Dr. Brian Torres",
    phone: "(512) 555-0267",
    email: "hello@smilesolutionstx.example.com",
    address: "3000 Bee Caves Rd",
    category: "dental",
    googleRating: 4.6,
    reviewCount: 87,
    scrapedData: {
      businessName: "Smile Solutions TX",
      tagline: "Advanced dentistry with a personal touch.",
      phone: "(512) 555-0267",
      address: "3000 Bee Caves Rd, Austin, TX",
      about: "Offering cutting-edge dental technology including 3D imaging, laser dentistry, and sedation options for anxious patients.",
      services: [
        { name: "Laser Dentistry", description: "Minimally invasive procedures using advanced laser technology." },
        { name: "Sedation Dentistry", description: "Comfortable options for patients with dental anxiety." },
        { name: "Crowns & Bridges", description: "Same-day CEREC crowns and traditional bridge work." },
        { name: "Root Canals", description: "Pain-free root canal therapy with modern techniques." },
        { name: "Teeth Whitening", description: "In-office and take-home whitening systems.", price: "From $299" },
      ],
      testimonials: [
        { name: "Steven M.", text: "I'm terrified of dentists but the sedation option here changed everything. Highly recommend.", rating: 5 },
        { name: "Diana L.", text: "Got a same-day crown and it was incredible. No temporary, no second visit.", rating: 5 },
        { name: "Frank J.", text: "Dr. Torres is honest and straightforward. Never tries to upsell. Rare find.", rating: 4 },
      ],
      photos: [],
      hours: "Mon-Fri 9am-6pm",
    },
  },

  // LAW FIRM
  {
    businessName: "Reynolds & Associates Law",
    ownerName: "Amanda Reynolds, Esq.",
    phone: "(512) 555-0345",
    email: "amanda@reynoldslaw.example.com",
    address: "100 Congress Ave, Suite 1500",
    category: "law-firm",
    currentWebsite: "http://reynoldslaw.example.com",
    googleRating: 4.9,
    reviewCount: 67,
    scrapedData: {
      businessName: "Reynolds & Associates Law",
      tagline: "Aggressive representation. Compassionate counsel.",
      phone: "(512) 555-0345",
      address: "100 Congress Ave, Suite 1500, Austin, TX",
      about: "Amanda Reynolds has recovered over $50 million for her clients in personal injury and wrongful death cases. With a 98% success rate, we fight relentlessly for the compensation you deserve.",
      services: [
        { name: "Personal Injury", description: "Car accidents, truck accidents, motorcycle crashes, and pedestrian injuries." },
        { name: "Wrongful Death", description: "Compassionate representation for families who have lost loved ones." },
        { name: "Medical Malpractice", description: "Holding healthcare providers accountable for negligence." },
        { name: "Workplace Injuries", description: "Workers' compensation and third-party liability claims." },
        { name: "Product Liability", description: "Defective product injuries and class action litigation." },
        { name: "Insurance Disputes", description: "Fighting denied or underpaid insurance claims." },
      ],
      testimonials: [
        { name: "Maria G.", text: "After my car accident, Amanda got me a settlement I never thought possible. She truly cares about her clients.", rating: 5 },
        { name: "Kevin R.", text: "They took my workplace injury case when two other firms turned me down. Won $450K. Life-changing.", rating: 5 },
        { name: "Linda & John M.", text: "Amanda handled our family's case with incredible compassion during the hardest time of our lives.", rating: 5 },
      ],
      photos: [],
      hours: "Mon-Fri 8am-6pm, 24/7 Emergency Line",
    },
  },
  {
    businessName: "Perez Family Law",
    ownerName: "Gabriel Perez, Esq.",
    phone: "(512) 555-0378",
    email: "gabe@perezfamilylaw.example.com",
    address: "2525 Wallingwood Dr",
    category: "law-firm",
    googleRating: 4.8,
    reviewCount: 93,
    scrapedData: {
      businessName: "Perez Family Law",
      tagline: "Protecting what matters most — your family.",
      phone: "(512) 555-0378",
      address: "2525 Wallingwood Dr, Austin, TX",
      about: "Gabriel Perez has spent 18 years exclusively practicing family law. We handle divorce, custody, adoption, and prenuptial agreements with discretion and skill.",
      services: [
        { name: "Divorce", description: "Contested and uncontested divorce representation." },
        { name: "Child Custody", description: "Custody, visitation, and modification cases." },
        { name: "Adoption", description: "Domestic, international, and stepparent adoptions." },
        { name: "Prenuptial Agreements", description: "Protecting assets before marriage." },
        { name: "Child Support", description: "Establishment, enforcement, and modification." },
        { name: "Mediation", description: "Collaborative dispute resolution to avoid court." },
      ],
      testimonials: [
        { name: "Sarah T.", text: "Gabe helped me through the most difficult time in my life. His empathy and legal skill are unmatched.", rating: 5 },
        { name: "Michael D.", text: "Got a fair custody arrangement that puts our kids first. Professional and honest.", rating: 5 },
        { name: "Christine R.", text: "The adoption process went smoothly thanks to this team. Forever grateful.", rating: 5 },
      ],
      photos: [],
      hours: "Mon-Fri 9am-5pm",
    },
  },

  // LANDSCAPING
  {
    businessName: "Lone Star Landscapes",
    ownerName: "Travis McCoy",
    phone: "(512) 555-0456",
    email: "travis@lonestarlscapes.example.com",
    address: "7800 Shoal Creek Blvd",
    category: "landscaping",
    currentWebsite: "http://lonestarlscapes.example.com",
    googleRating: 4.7,
    reviewCount: 156,
    scrapedData: {
      businessName: "Lone Star Landscapes",
      tagline: "Transforming Texas backyards since 2011.",
      phone: "(512) 555-0456",
      address: "7800 Shoal Creek Blvd, Austin, TX",
      about: "From custom patio builds to full property makeovers, Lone Star Landscapes has completed over 800 projects across the Austin area. We're licensed, insured, and obsessed with quality.",
      services: [
        { name: "Landscape Design", description: "Custom designs from our certified landscape architects." },
        { name: "Patio & Hardscaping", description: "Patios, walkways, retaining walls, and outdoor kitchens." },
        { name: "Lawn Maintenance", description: "Weekly mowing, edging, fertilization, and weed control." },
        { name: "Irrigation Systems", description: "Smart sprinkler installation and repair." },
        { name: "Tree Trimming", description: "Professional tree trimming, removal, and stump grinding." },
        { name: "Outdoor Lighting", description: "Landscape lighting design and installation." },
      ],
      testimonials: [
        { name: "Karen & Pete L.", text: "Our backyard went from a dirt lot to an absolute oasis. Travis and crew are the real deal.", rating: 5 },
        { name: "Brad H.", text: "They've maintained our commercial property for 3 years. Always on time, always professional.", rating: 5 },
        { name: "Nancy W.", text: "The patio they built is gorgeous. We basically live outside now. Worth every penny.", rating: 5 },
      ],
      photos: [],
      hours: "Mon-Sat 7am-6pm",
    },
  },
  {
    businessName: "Hill Country Lawns",
    ownerName: "Jake Morrison",
    phone: "(512) 555-0489",
    email: "jake@hillcountrylawns.example.com",
    address: "12400 Parmer Ln",
    category: "landscaping",
    googleRating: 4.5,
    reviewCount: 72,
    scrapedData: {
      businessName: "Hill Country Lawns",
      tagline: "Premium lawn care for Austin homes and businesses.",
      phone: "(512) 555-0489",
      address: "12400 Parmer Ln, Austin, TX",
      about: "Specializing in drought-resistant landscaping and native Texas plants. We create beautiful, sustainable outdoor spaces that thrive in the Texas heat.",
      services: [
        { name: "Xeriscaping", description: "Water-wise landscaping with native and adapted plants." },
        { name: "Sod Installation", description: "Bermuda, Zoysia, and St. Augustine sod installation." },
        { name: "Garden Design", description: "Flower beds, herb gardens, and seasonal color plantings." },
        { name: "Mulching & Beds", description: "Bed preparation, mulching, and soil amendment." },
        { name: "Seasonal Cleanup", description: "Spring prep, fall cleanup, and leaf removal." },
      ],
      testimonials: [
        { name: "Doug S.", text: "Jake xeriscaped our entire front yard. Water bill dropped 40% and it looks amazing.", rating: 5 },
        { name: "Wendy M.", text: "They installed our sod and it was like night and day. Neighborhood looks jealous.", rating: 4 },
        { name: "Tom & Lisa R.", text: "Reliable, affordable, and they actually care about the work. Rare combo.", rating: 5 },
      ],
      photos: [],
      hours: "Mon-Fri 7am-5pm, Sat 8am-12pm",
    },
  },

  // SALON
  {
    businessName: "Velvet Hair Studio",
    ownerName: "Maya Johnson",
    phone: "(512) 555-0567",
    email: "maya@velvethair.example.com",
    address: "2000 E 6th St",
    category: "salon",
    currentWebsite: "http://velvethair.example.com",
    googleRating: 4.9,
    reviewCount: 312,
    scrapedData: {
      businessName: "Velvet Hair Studio",
      tagline: "Where color meets artistry. East Austin's favorite salon.",
      phone: "(512) 555-0567",
      address: "2000 E 6th St, Austin, TX",
      about: "Velvet Hair Studio is a boutique salon specializing in balayage, vivid colors, and precision cuts. Founded by Maya Johnson, a 12-year industry veteran trained at Sassoon Academy.",
      services: [
        { name: "Women's Cut & Style", description: "Precision cut with blowout styling.", price: "$75+" },
        { name: "Men's Cut", description: "Classic or modern cuts with hot towel finish.", price: "$40+" },
        { name: "Balayage", description: "Hand-painted highlights for a natural sun-kissed look.", price: "$180+" },
        { name: "Full Color", description: "All-over color with premium products.", price: "$130+" },
        { name: "Vivid Colors", description: "Bold, fashion-forward color transformations.", price: "$200+" },
        { name: "Keratin Treatment", description: "Smoothing treatment for frizz-free, silky hair.", price: "$275+" },
        { name: "Bridal Styling", description: "Wedding-day hair and trial sessions.", price: "$150+" },
        { name: "Deep Conditioning", description: "Intensive moisture and repair treatment.", price: "$45+" },
      ],
      testimonials: [
        { name: "Emma K.", text: "Maya is a balayage goddess. My hair has never looked better. Everyone asks where I go.", rating: 5 },
        { name: "Aisha R.", text: "Finally found my forever salon. The vibe, the talent, the results — all perfect.", rating: 5 },
        { name: "Jessica T.", text: "Got a vivid purple color done here and it lasted months. Maya really knows color theory.", rating: 5 },
      ],
      photos: [],
      hours: "Tue-Sat 10am-7pm",
      socialLinks: { instagram: "https://instagram.com/velvethairstudio" },
    },
  },
  {
    businessName: "The Grooming Lounge",
    ownerName: "Derek Washington",
    phone: "(512) 555-0589",
    email: "derek@groominglounge.example.com",
    address: "405 W 2nd St",
    category: "salon",
    googleRating: 4.7,
    reviewCount: 198,
    scrapedData: {
      businessName: "The Grooming Lounge",
      tagline: "Premium barbering and grooming for the modern gentleman.",
      phone: "(512) 555-0589",
      address: "405 W 2nd St, Austin, TX",
      about: "Part barbershop, part lounge. We offer classic cuts, straight razor shaves, and beard sculpting in a relaxed, upscale environment. Complimentary whiskey with every service.",
      services: [
        { name: "Classic Cut", description: "Traditional barbershop cut with hot towel.", price: "$45" },
        { name: "Fade & Design", description: "Skin fades, mid fades, and custom hair designs.", price: "$55" },
        { name: "Straight Razor Shave", description: "Traditional hot lather straight razor shave.", price: "$40" },
        { name: "Beard Sculpting", description: "Precision beard shaping and conditioning.", price: "$30" },
        { name: "The Full Package", description: "Cut, shave, beard trim, and hot towel.", price: "$95" },
      ],
      testimonials: [
        { name: "Marcus J.", text: "Best barbershop in Austin, hands down. Derek takes his time and the results are always clean.", rating: 5 },
        { name: "Ryan P.", text: "The vibe here is unmatched. Great music, great drinks, great cuts.", rating: 5 },
        { name: "Tony S.", text: "I drive 30 minutes to come here because nobody else gets my fade right. Worth it.", rating: 5 },
      ],
      photos: [],
      hours: "Tue-Sat 9am-7pm, Sun 10am-4pm",
      socialLinks: { instagram: "https://instagram.com/groomingloungeatx" },
    },
  },
];

export function getMockProspects(city: string, state: string, category?: Category): Omit<Prospect, "id" | "createdAt" | "updatedAt">[] {
  let businesses = mockBusinesses;
  if (category) {
    businesses = businesses.filter((b) => b.category === category);
  }

  return businesses.map((b) => ({
    businessName: b.businessName,
    ownerName: b.ownerName,
    phone: b.phone,
    email: b.email,
    address: b.address,
    city,
    state: state || "TX",
    category: b.category,
    currentWebsite: b.currentWebsite,
    googleRating: b.googleRating,
    reviewCount: b.reviewCount,
    estimatedRevenueTier: b.reviewCount > 100 ? "high" as const : b.reviewCount > 50 ? "medium" as const : "low" as const,
    status: "scouted" as const,
    scrapedData: b.scrapedData,
  }));
}
