import type { Prospect, Category, ScrapedData } from "./types";
import { CATEGORY_CONFIG } from "./types";
import { updateProspect, saveScrapedData } from "./store";

export interface GeneratedSiteData {
  id: string;
  category: Category;
  businessName: string;
  tagline: string;
  accentColor: string;
  heroGradient: string;
  phone: string;
  address: string;
  about: string;
  services: { name: string; description?: string; price?: string; icon?: string }[];
  testimonials: { name: string; text: string; rating?: number }[];
  photos: string[];
  hours?: string;
  socialLinks?: Record<string, string>;
  stats: { value: string; label: string }[];
}

function generateDefaultTagline(businessName: string, category: Category): string {
  const label = CATEGORY_CONFIG[category]?.label || "business";
  const taglines: Partial<Record<Category, string>> = {
    "real-estate": `Your trusted real estate partner. ${businessName} helps you find your dream home.`,
    dental: `Modern dental care for the whole family. ${businessName} is accepting new patients.`,
    "law-firm": `Experienced attorneys fighting for your rights. ${businessName} offers free consultations.`,
    landscaping: `Transform your outdoor space with ${businessName}. Professional landscaping services.`,
    salon: `Where artistry meets luxury. ${businessName} — premium hair and beauty services.`,
  };
  return taglines[category] || `${businessName} — trusted ${label.toLowerCase()} services for your community.`;
}

function generateDefaultAbout(businessName: string, category: Category): string {
  const label = CATEGORY_CONFIG[category]?.label || "business";
  const aboutTexts: Partial<Record<Category, string>> = {
    "real-estate": `${businessName} is a trusted name in local real estate, helping buyers and sellers navigate the market with expert guidance and personalized service.`,
    dental: `At ${businessName}, we provide comprehensive dental care in a comfortable, modern setting. Our experienced team treats patients of all ages using the latest technology and techniques.`,
    "law-firm": `${businessName} provides dedicated legal representation with a personal touch. Our attorneys bring years of experience and a proven track record of results.`,
    landscaping: `${businessName} transforms outdoor spaces into stunning landscapes. From design to installation to maintenance, our team delivers exceptional craftsmanship.`,
    salon: `${businessName} is a premier salon offering expert hair and beauty services in a relaxing atmosphere. Our talented team delivers results that make you feel amazing.`,
  };
  return aboutTexts[category] || `${businessName} is a trusted ${label.toLowerCase()} provider committed to delivering exceptional quality and service. With years of experience serving the local community, we take pride in every project and every client relationship.`;
}

function generateStats(category: Category, reviewCount?: number): { value: string; label: string }[] {
  const baseStats: Partial<Record<Category, { value: string; label: string }[]>> = {
    "real-estate": [
      { value: `${Math.floor(Math.random() * 400 + 200)}+`, label: "Homes Sold" },
      { value: `$${Math.floor(Math.random() * 150 + 50)}M`, label: "In Sales Volume" },
      { value: `${Math.floor(Math.random() * 15 + 5)}+`, label: "Years Experience" },
      { value: reviewCount ? `${(reviewCount > 100 ? 4.8 : 4.6).toFixed(1)}★` : "4.8★", label: "Client Rating" },
    ],
    dental: [
      { value: `${Math.floor(Math.random() * 8000 + 2000)}+`, label: "Patients Served" },
      { value: `${Math.floor(Math.random() * 15 + 5)}+`, label: "Years Experience" },
      { value: "Same Day", label: "Emergency Care" },
      { value: reviewCount ? `${(reviewCount > 100 ? 4.8 : 4.6).toFixed(1)}★` : "4.8★", label: "Patient Rating" },
    ],
    "law-firm": [
      { value: `$${Math.floor(Math.random() * 40 + 10)}M+`, label: "Recovered" },
      { value: `${Math.floor(Math.random() * 800 + 200)}+`, label: "Cases Won" },
      { value: `${Math.floor(Math.random() * 15 + 10)}+`, label: "Years Experience" },
      { value: "Free", label: "Consultation" },
    ],
    landscaping: [
      { value: `${Math.floor(Math.random() * 600 + 200)}+`, label: "Projects Completed" },
      { value: `${Math.floor(Math.random() * 10 + 5)}+`, label: "Years in Business" },
      { value: "100%", label: "Licensed & Insured" },
      { value: reviewCount ? `${(reviewCount > 100 ? 4.8 : 4.6).toFixed(1)}★` : "4.7★", label: "Average Rating" },
    ],
    salon: [
      { value: `${Math.floor(Math.random() * 8000 + 2000)}+`, label: "Happy Clients" },
      { value: `${Math.floor(Math.random() * 10 + 3)}+`, label: "Expert Stylists" },
      { value: `${Math.floor(Math.random() * 10 + 5)}+`, label: "Years Open" },
      { value: reviewCount ? `${(reviewCount > 100 ? 4.9 : 4.7).toFixed(1)}★` : "4.9★", label: "Average Rating" },
    ],
  };
  const rating = reviewCount ? `${(reviewCount > 100 ? 4.8 : 4.6).toFixed(1)}★` : "4.8★";
  return baseStats[category] || [
    { value: `${Math.floor(Math.random() * 500 + 200)}+`, label: "Clients Served" },
    { value: `${Math.floor(Math.random() * 10 + 5)}+`, label: "Years Experience" },
    { value: "100%", label: "Licensed & Insured" },
    { value: rating, label: "Average Rating" },
  ];
}

export function generateSiteData(prospect: Prospect): GeneratedSiteData {
  const { category, scrapedData } = prospect;
  const config = CATEGORY_CONFIG[category];
  const sd = scrapedData || {} as ScrapedData;

  return {
    id: prospect.id,
    category,
    businessName: sd.businessName || prospect.businessName,
    tagline: sd.tagline || generateDefaultTagline(prospect.businessName, category),
    accentColor: config.accentColor,
    heroGradient: config.heroGradient,
    phone: sd.phone || prospect.phone || "(555) 000-0000",
    address: sd.address || `${prospect.address}, ${prospect.city}, ${prospect.state}`,
    about: sd.about || generateDefaultAbout(prospect.businessName, category),
    services: sd.services.length > 0 ? sd.services : getDefaultServices(category),
    testimonials: sd.testimonials.length > 0 ? sd.testimonials : getDefaultTestimonials(category),
    photos: sd.photos || [],
    hours: sd.hours,
    socialLinks: sd.socialLinks,
    stats: generateStats(category, prospect.reviewCount),
  };
}

export async function generatePreview(prospect: Prospect): Promise<string> {
  console.log(`  🏗️ Generating preview for "${prospect.businessName}"...`);

  const siteData = generateSiteData(prospect);

  // Save the generated data
  await saveScrapedData(prospect.id, siteData);

  // Update prospect status
  const previewUrl = `/preview/${prospect.id}`;
  await updateProspect(prospect.id, {
    status: "pending-review",
    generatedSiteUrl: previewUrl,
  });

  console.log(`  ✅ Preview ready: ${previewUrl}`);
  return previewUrl;
}

function getDefaultServices(category: Category) {
  const defaults: Partial<Record<Category, { name: string; description: string }[]>> = {
    "real-estate": [
      { name: "Buyer Representation", description: "Expert guidance through the home buying process." },
      { name: "Seller Services", description: "Professional marketing and negotiations to sell your home." },
      { name: "Market Analysis", description: "Comprehensive local market data and property valuations." },
      { name: "Investment Properties", description: "Finding profitable investment opportunities." },
    ],
    dental: [
      { name: "General Dentistry", description: "Cleanings, exams, and preventive care." },
      { name: "Cosmetic Dentistry", description: "Whitening, veneers, and smile makeovers." },
      { name: "Dental Implants", description: "Permanent tooth replacement solutions." },
      { name: "Emergency Care", description: "Same-day emergency dental services." },
    ],
    "law-firm": [
      { name: "Personal Injury", description: "Car accidents, slip and fall, and more." },
      { name: "Family Law", description: "Divorce, custody, and adoption cases." },
      { name: "Criminal Defense", description: "Aggressive defense for all charges." },
      { name: "Estate Planning", description: "Wills, trusts, and power of attorney." },
    ],
    landscaping: [
      { name: "Landscape Design", description: "Custom outdoor space design and planning." },
      { name: "Lawn Maintenance", description: "Weekly mowing, edging, and fertilization." },
      { name: "Hardscaping", description: "Patios, walkways, and retaining walls." },
      { name: "Tree Services", description: "Trimming, removal, and stump grinding." },
    ],
    salon: [
      { name: "Haircuts & Styling", description: "Precision cuts and blowout styling." },
      { name: "Color Services", description: "Full color, highlights, and balayage." },
      { name: "Treatments", description: "Keratin, deep conditioning, and repair." },
      { name: "Special Occasions", description: "Bridal and event styling." },
    ],
    electrician: [
      { name: "Residential Wiring", description: "New installation, rewiring, and panel upgrades." },
      { name: "Commercial Electric", description: "Office and retail electrical services." },
      { name: "Emergency Service", description: "24/7 emergency electrical repairs." },
      { name: "Lighting Installation", description: "Indoor, outdoor, and landscape lighting." },
    ],
    plumber: [
      { name: "Emergency Plumbing", description: "24/7 emergency leak and pipe repairs." },
      { name: "Drain Cleaning", description: "Professional drain clearing and maintenance." },
      { name: "Water Heater Service", description: "Installation, repair, and replacement." },
      { name: "Bathroom Remodeling", description: "Full bathroom renovation and fixture installation." },
    ],
    hvac: [
      { name: "AC Repair", description: "Fast, reliable air conditioning repairs." },
      { name: "Heating Service", description: "Furnace and heat pump maintenance and repair." },
      { name: "Installation", description: "New HVAC system design and installation." },
      { name: "Maintenance Plans", description: "Annual tune-ups and preventive maintenance." },
    ],
    roofing: [
      { name: "Roof Replacement", description: "Complete roof tear-off and replacement." },
      { name: "Roof Repair", description: "Leak repair, shingle replacement, and storm damage." },
      { name: "Inspections", description: "Comprehensive roof assessments and reports." },
      { name: "Gutter Services", description: "Gutter installation, repair, and cleaning." },
    ],
    "auto-repair": [
      { name: "Engine Diagnostics", description: "Computer diagnostics and engine repair." },
      { name: "Brake Service", description: "Brake pad replacement, rotor resurfacing, and fluid flush." },
      { name: "Oil Change", description: "Quick oil changes with premium synthetic options." },
      { name: "AC & Heating", description: "Auto climate control repair and recharging." },
    ],
    fitness: [
      { name: "Personal Training", description: "One-on-one custom workout programs." },
      { name: "Group Classes", description: "High-energy group fitness for all levels." },
      { name: "Nutrition Coaching", description: "Meal planning and nutritional guidance." },
      { name: "Online Training", description: "Virtual coaching from anywhere." },
    ],
    veterinary: [
      { name: "Wellness Exams", description: "Annual checkups and preventive care." },
      { name: "Vaccinations", description: "Core and lifestyle vaccinations for dogs and cats." },
      { name: "Surgery", description: "Spay/neuter, dental, and soft tissue surgery." },
      { name: "Emergency Care", description: "Urgent and emergency veterinary services." },
    ],
  };
  const label = CATEGORY_CONFIG[category]?.label || "Business";
  return defaults[category] || [
    { name: "Consultation", description: `Free initial ${label.toLowerCase()} consultation.` },
    { name: "Full Service", description: `Comprehensive ${label.toLowerCase()} services tailored to your needs.` },
    { name: "Emergency Service", description: "Available for urgent needs and quick turnarounds." },
    { name: "Maintenance", description: "Ongoing support and maintenance packages." },
  ];
}

function getDefaultTestimonials(category: Category) {
  const defaults: Partial<Record<Category, { name: string; text: string }[]>> = {
    "real-estate": [
      { name: "Happy Client", text: "Found our dream home quickly. The process was incredibly smooth." },
      { name: "Satisfied Seller", text: "Sold above asking price in just two weeks. Highly recommend!" },
      { name: "First-Time Buyer", text: "They made buying my first home easy and stress-free." },
    ],
    dental: [
      { name: "Patient", text: "Best dental experience I've ever had. Gentle, professional, and thorough." },
      { name: "Parent", text: "My kids love going to the dentist now. The staff is amazing with children." },
      { name: "New Patient", text: "Modern office, friendly team, and completely painless procedures." },
    ],
    "law-firm": [
      { name: "Client", text: "They fought for me when no one else would. Got the settlement I deserved." },
      { name: "Grateful Client", text: "Professional, compassionate, and incredibly effective. Can't thank them enough." },
      { name: "Referred Client", text: "Was referred by a friend and now I understand why. Outstanding representation." },
    ],
    landscaping: [
      { name: "Homeowner", text: "Our yard went from embarrassing to the best on the block. Amazing work." },
      { name: "Repeat Customer", text: "They've maintained our property for years. Always reliable and professional." },
      { name: "Happy Client", text: "The patio they built is absolutely stunning. We practically live outside now." },
    ],
    salon: [
      { name: "Regular Client", text: "Best salon in town. My hair has never looked better!" },
      { name: "New Client", text: "Finally found my forever salon. The talent here is incredible." },
      { name: "Bride", text: "Made me feel like a princess on my wedding day. Couldn't be happier." },
    ],
  };
  return defaults[category] || [
    { name: "Happy Customer", text: "Outstanding service from start to finish. Highly recommend to anyone!" },
    { name: "Returning Client", text: "We've been coming back for years. Consistently excellent quality and professionalism." },
    { name: "New Client", text: "Wish I had found them sooner. Made the entire experience easy and stress-free." },
  ];
}
