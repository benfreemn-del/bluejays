/**
 * Video Sales Letter (VSL) Script Generator
 *
 * Auto-generates personalized VSL scripts for each prospect using the
 * Hook → Agitate → Solution → Proof → CTA framework.
 *
 * Each section is dynamically populated from the prospect's real data:
 * business name, category, city, Google rating, review count,
 * scraped services, and existing website issues.
 */

import type { Prospect, Category } from "./types";
import { CATEGORY_CONFIG } from "./types";

export interface VslScript {
  hook: string;
  agitate: string;
  solution: string;
  proof: string;
  cta: string;
  fullScript: string;
  generatedAt: string;
  wordCount: number;
  estimatedDuration: string; // e.g. "2:30"
}

// ─── Category-specific pain points ───────────────────────────────────

const CATEGORY_PAIN_POINTS: Partial<Record<Category, { pain: string; loss: string; benefit: string }>> = {
  "real-estate": {
    pain: "losing listings to agents with slicker online presence",
    loss: "potential sellers are choosing agents who look more professional online — even if they're less experienced",
    benefit: "a property showcase that makes sellers want to list with you on sight",
  },
  dental: {
    pain: "watching new patients choose the practice down the street",
    loss: "every day without a modern site, patients are booking with competitors who simply look more trustworthy online",
    benefit: "a patient-first website that builds trust before they even walk through the door",
  },
  "law-firm": {
    pain: "potential clients leaving your site before they ever pick up the phone",
    loss: "high-value cases are going to firms that look more established online — even if you have more experience",
    benefit: "a professional presence that converts visitors into consultations",
  },
  landscaping: {
    pain: "homeowners scrolling right past your business to competitors with better photos",
    loss: "every week, property owners in your area are hiring landscapers who simply present their work better online",
    benefit: "a visual portfolio that sells your craftsmanship before you even give a quote",
  },
  salon: {
    pain: "new clients booking with the salon that has the prettier Instagram and website",
    loss: "style-conscious clients judge your skills by your online presence — an outdated site sends them elsewhere",
    benefit: "a stunning showcase that makes clients feel your expertise before they sit in the chair",
  },
  electrician: {
    pain: "homeowners calling the first electrician that looks legit online",
    loss: "emergency calls and big jobs are going to competitors who simply show up better in search results",
    benefit: "a professional site that makes you the obvious choice when someone needs electrical work",
  },
  plumber: {
    pain: "emergency calls going to whichever plumber looks most trustworthy on Google",
    loss: "when a pipe bursts at 2 AM, customers call the plumber with the best-looking online presence — not necessarily the best plumber",
    benefit: "a trust-building site that makes you the first call for every plumbing emergency",
  },
  hvac: {
    pain: "seasonal customers choosing HVAC companies that look more established",
    loss: "when the AC breaks in July or the furnace dies in January, homeowners pick the company that looks most reliable online",
    benefit: "a professional presence that captures urgent seasonal demand",
  },
  roofing: {
    pain: "losing bids to roofing companies with better online credibility",
    loss: "homeowners making $10,000+ decisions are choosing roofers who look more professional — even if your work is better",
    benefit: "a credibility-building site that wins bids before you even show up to estimate",
  },
  "auto-repair": {
    pain: "car owners driving past your shop to the one with better reviews and a nicer website",
    loss: "vehicle owners research online before choosing a mechanic — a weak web presence means empty bays",
    benefit: "a trust-first website that turns online searchers into loyal customers",
  },
  fitness: {
    pain: "potential members joining the gym with the flashier website",
    loss: "fitness-minded people judge a gym's quality by its online presence — a dated site means they never walk through your door",
    benefit: "an energizing website that converts browsers into members",
  },
  veterinary: {
    pain: "pet owners choosing the vet clinic that feels most caring online",
    loss: "pet parents are incredibly protective — they choose the vet that looks most compassionate and modern online",
    benefit: "a warm, trustworthy site that makes pet owners feel their fur babies are in the best hands",
  },
  chiropractic: {
    pain: "patients choosing the chiropractor who looks most credible online",
    loss: "people in pain research extensively before choosing a chiropractor — a weak site means they pick someone else",
    benefit: "a professional, educational site that positions you as the trusted expert in your area",
  },
  accounting: {
    pain: "business owners trusting their finances to the accountant with the most professional image",
    loss: "clients handling thousands in taxes and finances want someone who looks established — a weak website undermines your expertise",
    benefit: "a polished, authoritative site that reflects the precision you bring to every client's books",
  },
  insurance: {
    pain: "potential policyholders choosing the agent who looks most trustworthy online",
    loss: "insurance is built on trust — if your website doesn't inspire confidence, prospects go to the agent who does",
    benefit: "a trust-centered website that makes prospects feel secure before they even call",
  },
  cleaning: {
    pain: "homeowners hiring the cleaning service with the most professional online presence",
    loss: "people inviting strangers into their homes want to feel safe — a polished site builds that trust instantly",
    benefit: "a clean, professional website that mirrors the quality of your service",
  },
  restaurant: {
    pain: "diners choosing restaurants that look more appetizing online",
    loss: "hungry customers browse menus and photos online before deciding where to eat — a weak site means empty tables",
    benefit: "a mouth-watering website that fills your tables before doors even open",
  },
};

function getCategoryContext(category: Category) {
  return CATEGORY_PAIN_POINTS[category] || {
    pain: "losing customers to competitors with a stronger online presence",
    loss: "every day without a professional website, potential customers are choosing businesses that simply look more credible online",
    benefit: "a modern, professional website that turns online visitors into paying customers",
  };
}

// ─── Script Generation ───────────────────────────────────────────────

function generateHook(prospect: Prospect): string {
  const ctx = getCategoryContext(prospect.category);
  const categoryLabel = CATEGORY_CONFIG[prospect.category]?.label || prospect.category;
  const name = prospect.ownerName?.split(" ")[0] || prospect.businessName;
  const city = prospect.city;

  const hasWebsite = !!prospect.currentWebsite;
  const lowRating = prospect.googleRating && prospect.googleRating < 4.0;
  const fewReviews = prospect.reviewCount !== undefined && prospect.reviewCount < 10;

  if (!hasWebsite) {
    return `${name}, let me ask you something. Right now, someone in ${city} is searching for a ${categoryLabel.toLowerCase()} business. They pull out their phone, they type it into Google — and what do they find? Every competitor has a website. But ${prospect.businessName}? Nothing. No site. No way to learn about you. No way to contact you. And just like that, they call someone else. This is happening every single day, and it's costing you real money.`;
  }

  if (lowRating) {
    return `${name}, here's something that might be hard to hear. When someone in ${city} searches for ${categoryLabel.toLowerCase()} services and finds ${prospect.businessName}, the first thing they see is your rating. And right now, that rating — combined with an outdated web presence — is sending potential customers straight to your competitors. But it doesn't have to stay this way.`;
  }

  if (fewReviews) {
    return `${name}, imagine this. A potential customer in ${city} is looking for a ${categoryLabel.toLowerCase()} business they can trust. They find ${prospect.businessName} — but then they see just ${prospect.reviewCount} reviews and a website that doesn't match the quality of your work. So they keep scrolling. This is ${ctx.pain} — and it's happening right now.`;
  }

  return `${name}, right now there's someone in ${city} who needs exactly what ${prospect.businessName} offers. They're on their phone, searching for ${categoryLabel.toLowerCase()} services. They find you — but then they see your current website. And in 3 seconds, they've already made a judgment about your business. The question is: does your website do you justice? Because right now, you're ${ctx.pain}.`;
}

function generateAgitate(prospect: Prospect): string {
  const ctx = getCategoryContext(prospect.category);
  const categoryLabel = CATEGORY_CONFIG[prospect.category]?.label || prospect.category;
  const hasWebsite = !!prospect.currentWebsite;
  const services = prospect.scrapedData?.services || [];
  const reviewCount = prospect.reviewCount || 0;

  const parts: string[] = [];

  parts.push(`Here's what's really happening: ${ctx.loss}.`);

  if (!hasWebsite) {
    parts.push(`Without any website at all, you're invisible to the majority of customers who search online before making a decision. Studies show that 97% of consumers search online for local businesses — and if you're not there, you don't exist to them.`);
  } else {
    parts.push(`Your current website might have worked five years ago, but today's customers expect more. They expect fast loading, mobile-friendly design, clear calls to action, and a professional look that matches the quality of your work.`);
  }

  if (services.length > 0) {
    const topServices = services.slice(0, 3).map(s => s.name).join(", ");
    parts.push(`You offer incredible services like ${topServices} — but if your website doesn't showcase them properly, customers will never know. They'll go to the competitor who presents their services better, even if your work is superior.`);
  }

  if (reviewCount > 20) {
    parts.push(`You've earned ${reviewCount} reviews from real customers who love your work. But all that social proof is sitting on Google, not on your website where it can actually convert new visitors into paying customers.`);
  }

  parts.push(`Every single day this continues, you're leaving money on the table. Not hundreds — potentially thousands of dollars in lost ${categoryLabel.toLowerCase()} business. And your competitors? They're picking up every customer you're missing.`);

  return parts.join("\n\n");
}

function generateSolution(prospect: Prospect): string {
  const categoryLabel = CATEGORY_CONFIG[prospect.category]?.label || prospect.category;
  const services = prospect.scrapedData?.services || [];

  const parts: string[] = [];

  parts.push(`That's exactly why we built BlueJays — and that's exactly why I'm reaching out to ${prospect.businessName} today. We specialize in building premium, custom websites specifically for ${categoryLabel.toLowerCase()} businesses. Not generic templates. Not cookie-cutter designs. Websites that are built from the ground up to convert visitors into customers.`);

  parts.push(`And here's the thing — we didn't just reach out with a pitch. We actually went ahead and built a complete, custom website for ${prospect.businessName}. For free. No strings attached.`);

  if (services.length > 0) {
    const serviceNames = services.slice(0, 4).map(s => s.name).join(", ");
    parts.push(`Your new site showcases your key services — ${serviceNames} — with compelling descriptions and clear calls to action. Every section is designed to move visitors closer to picking up the phone and calling you.`);
  }

  parts.push(`It's fully mobile-responsive, lightning-fast, and designed with the latest conversion principles that the top ${categoryLabel.toLowerCase()} businesses use. We're talking about a website that doesn't just look good — it actively brings you more business.`);

  return parts.join("\n\n");
}

function generateProof(prospect: Prospect): string {
  const parts: string[] = [];
  const rating = prospect.googleRating;
  const reviewCount = prospect.reviewCount || 0;
  const services = prospect.scrapedData?.services || [];
  const testimonials = prospect.scrapedData?.testimonials || [];
  const city = prospect.city;

  parts.push(`Now, let me show you why this works specifically for ${prospect.businessName}:`);

  if (rating && rating >= 4.0) {
    parts.push(`First — you have a ${rating}-star rating${reviewCount > 0 ? ` with ${reviewCount} reviews` : ""}. That's incredible social proof. Your new website puts that front and center, so every visitor sees it immediately. When someone lands on your site and sees real customers raving about your work, their trust skyrockets.`);
  } else if (rating) {
    parts.push(`Your current ${rating}-star rating tells us there's room to grow — and a professional website is one of the fastest ways to improve customer perception and attract the kind of clients who leave 5-star reviews.`);
  }

  if (testimonials.length > 0) {
    const topReview = testimonials[0];
    const snippet = topReview.text.length > 80 ? topReview.text.slice(0, 80) + "..." : topReview.text;
    parts.push(`We found a review from ${topReview.name} that says: "${snippet}" — that kind of feedback is gold, and it's featured prominently on your new site.`);
  }

  if (services.length > 0) {
    parts.push(`We identified ${services.length} services that ${prospect.businessName} offers and built dedicated sections for each one. When someone searches for "${services[0].name} in ${city}," your site is designed to capture that traffic and convert it.`);
  }

  parts.push(`This isn't a generic template we slapped your name on. Every element — from the colors to the copy to the layout — was built specifically for ${prospect.businessName} in ${city}. It reflects who you are and what makes you different.`);

  return parts.join("\n\n");
}

function generateCta(prospect: Prospect): string {
  const name = prospect.ownerName?.split(" ")[0] || prospect.businessName;

  return `${name}, your custom website is live and ready for you to see right now. All you have to do is click the link below to check it out. Take 30 seconds — that's all I'm asking. Look at it on your phone, show it to your team, see how it feels.

If you love it — and I think you will — we can have it live on your own domain within 48 hours. Your customers will see a completely transformed online presence, and you'll start capturing the business you've been missing.

If it's not for you, no hard feelings at all. But at least take a look at what's possible for ${prospect.businessName}. You've got nothing to lose and everything to gain.

Click the link. See your new site. And let's talk about taking ${prospect.businessName} to the next level.`;
}

// ─── Main Generator ──────────────────────────────────────────────────

export function generateVslScript(prospect: Prospect): VslScript {
  const hook = generateHook(prospect);
  const agitate = generateAgitate(prospect);
  const solution = generateSolution(prospect);
  const proof = generateProof(prospect);
  const cta = generateCta(prospect);

  const fullScript = [
    "=== HOOK (Pain Point) ===",
    hook,
    "",
    "=== AGITATE (What They're Losing) ===",
    agitate,
    "",
    "=== SOLUTION (What BlueJays Offers) ===",
    solution,
    "",
    "=== PROOF (Their Specific Data) ===",
    proof,
    "",
    "=== CTA (Claim Their Site) ===",
    cta,
  ].join("\n\n");

  const wordCount = fullScript.split(/\s+/).length;
  // Average speaking rate: ~150 words per minute
  const minutes = Math.floor(wordCount / 150);
  const seconds = Math.round(((wordCount / 150) - minutes) * 60);
  const estimatedDuration = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return {
    hook,
    agitate,
    solution,
    proof,
    cta,
    fullScript,
    generatedAt: new Date().toISOString(),
    wordCount,
    estimatedDuration,
  };
}
