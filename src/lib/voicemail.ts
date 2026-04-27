/**
 * Voicemail Drop System — Twilio-powered ringless voicemail drops.
 *
 * Uses Twilio's programmable voice to call the prospect's number
 * and leave a pre-recorded voicemail when it goes to voicemail.
 *
 * The system uses AMD (Answering Machine Detection) to detect
 * voicemail and plays the pre-recorded message. If a human answers,
 * it hangs up (we only want voicemail drops, not live calls).
 *
 * PERSONALIZED VOICEMAIL SCRIPTS (v2):
 * Scripts now reference specific business data to make each voicemail
 * feel like it was recorded just for them:
 * - Google rating and review count
 * - Specific services they offer
 * - Whether their current site is mobile-friendly
 * - Their city/location
 * - Category-specific language
 */

import { v4 as uuidv4 } from "uuid";
import { supabase, isSupabaseConfigured } from "./supabase";
import { logCost, COST_RATES } from "./cost-logger";
import type { Prospect } from "./types";
import { CATEGORY_CONFIG } from "./types";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
// Hardcoded per CLAUDE.md Rule 16 — Vercel had stale NEXT_PUBLIC_BASE_URL
// which broke voicemail TwiML audio callbacks.
const BASE_URL = "https://bluejayportfolio.com";

// Pre-recorded voicemail URL — Ben records this and we host it
// For now, use Twilio's TTS as fallback until Ben uploads his recording
const VOICEMAIL_AUDIO_URL = `${BASE_URL}/api/voicemail/audio`;

export interface VoicemailDrop {
  id: string;
  prospectId: string;
  to: string;
  from: string;
  status: "queued" | "sent" | "delivered" | "failed" | "human-answered";
  sentAt: string;
  duration?: number;
  scriptType?: string;
}

/**
 * Drop a voicemail to a prospect's phone.
 * Uses Twilio AMD to detect voicemail, plays pre-recorded message.
 */
export async function dropVoicemail(
  prospectId: string,
  to: string,
  businessName: string,
  stage: "initial" | "followUp" = "initial"
): Promise<VoicemailDrop> {
  const drop: VoicemailDrop = {
    id: uuidv4(),
    prospectId,
    to,
    from: TWILIO_PHONE_NUMBER || "+10000000000",
    status: "queued",
    sentAt: new Date().toISOString(),
  };

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.log(`  [MOCK] Voicemail drop to ${to} for ${businessName}`);
    drop.status = "sent";
    await logVoicemailDrop(drop);
    return drop;
  }

  try {
    console.log(`  Dropping voicemail to ${to} for ${businessName}...`);

    // Create a Twilio call with AMD (Answering Machine Detection)
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`;
    const twimlUrl = `${BASE_URL}/api/voicemail/twiml?prospectId=${encodeURIComponent(prospectId)}&businessName=${encodeURIComponent(businessName)}&stage=${encodeURIComponent(stage)}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: to,
        From: TWILIO_PHONE_NUMBER,
        Url: twimlUrl, // TwiML that plays the voicemail
        MachineDetection: "DetectMessageEnd", // Wait for beep before playing
        MachineDetectionTimeout: "10",
        AsyncAmd: "true",
        AsyncAmdStatusCallback: `${BASE_URL}/api/voicemail/status?dropId=${drop.id}`,
        Timeout: "20", // Ring for 20 seconds max
      }),
    });

    if (response.ok) {
      const data = await response.json();
      drop.status = "sent";
      console.log(`  Voicemail call initiated: ${data.sid}`);

      // Log the cost of this voicemail drop
      await logCost({
        prospectId,
        service: "twilio_voice",
        action: "voicemail_drop",
        costUsd: COST_RATES.twilio_voice,
        metadata: { callSid: data.sid, to, businessName },
      });
    } else {
      const errText = await response.text();
      console.error(`  Twilio call failed: ${errText}`);
      drop.status = "failed";

      // Log the failed cost attempt
      await logCost({
        prospectId,
        service: "twilio_voice",
        action: "voicemail_drop",
        costUsd: 0,
        status: "failed",
        metadata: { error: errText.substring(0, 200), to },
      });
    }
  } catch (error) {
    console.error(`  Voicemail drop error: ${(error as Error).message}`);
    drop.status = "failed";
  }

  await logVoicemailDrop(drop);
  return drop;
}

// ═══════════════════════════════════════════════════════════════
// PERSONALIZED VOICEMAIL SCRIPTS
// Each script references specific business data to feel custom-recorded
// ═══════════════════════════════════════════════════════════════

/**
 * Business data context for generating personalized voicemail scripts.
 */
export interface VoicemailContext {
  businessName: string;
  ownerName?: string;
  category: string;
  city?: string;
  state?: string;
  googleRating?: number;
  reviewCount?: number;
  currentWebsite?: string;
  services?: string[];
  phone?: string;
}

/**
 * Extract voicemail context from a full Prospect object.
 */
export function extractVoicemailContext(prospect: Prospect): VoicemailContext {
  return {
    businessName: prospect.businessName,
    ownerName: prospect.ownerName,
    category: prospect.category,
    city: prospect.city,
    state: prospect.state,
    googleRating: prospect.googleRating,
    reviewCount: prospect.reviewCount,
    currentWebsite: prospect.currentWebsite,
    services: prospect.scrapedData?.services?.map((s) => s.name) || [],
    phone: prospect.phone,
  };
}

/**
 * Generate a personalized initial voicemail script.
 *
 * References specific business data:
 * - Google rating and review count (if available)
 * - Specific services they offer
 * - Whether they have a current website (and if it's mobile-friendly)
 * - Their city/location
 * - Category-specific language
 *
 * Each voicemail should feel like Ben personally researched this business
 * before calling.
 */
export function generatePersonalizedScript(
  ctx: VoicemailContext,
  scriptType: "initial" | "followUp" | "reEngage" = "initial"
): string {
  const name = ctx.ownerName?.split(" ")[0] || "";
  const greeting = name ? `Hey ${name}` : "Hey there";
  const categoryLabel = (CATEGORY_CONFIG as Record<string, { label: string; accentColor: string; heroGradient: string } | undefined>)[ctx.category]?.label || ctx.category?.replace(/-/g, " ") || "business";

  switch (scriptType) {
    case "initial":
      return generateInitialScript(ctx, greeting, categoryLabel);
    case "followUp":
      return generateFollowUpScript(ctx, greeting, categoryLabel);
    case "reEngage":
      return generateReEngageScript(ctx, greeting, categoryLabel);
    default:
      return generateInitialScript(ctx, greeting, categoryLabel);
  }
}

/**
 * Initial voicemail — first contact.
 * Heavy personalization to stand out from generic sales calls.
 */
function generateInitialScript(
  ctx: VoicemailContext,
  greeting: string,
  categoryLabel: string
): string {
  const parts: string[] = [];

  // Opening — personalized based on what data we have
  parts.push(`${greeting}, this is Ben from BlueJays.`);

  // Google reviews hook — the strongest personalization signal
  if (ctx.googleRating && ctx.reviewCount && ctx.reviewCount > 5) {
    if (ctx.googleRating >= 4.5) {
      parts.push(
        `I was looking at ${ctx.businessName} online and honestly, ${ctx.googleRating} stars across ${ctx.reviewCount} reviews is seriously impressive. Your customers clearly love what you do.`
      );
    } else if (ctx.googleRating >= 4.0) {
      parts.push(
        `I came across ${ctx.businessName} and noticed you've got ${ctx.googleRating} stars on Google with ${ctx.reviewCount} reviews. That's a solid reputation you've built.`
      );
    } else {
      parts.push(
        `I found ${ctx.businessName} online and I can see you've been building up your presence with ${ctx.reviewCount} reviews on Google.`
      );
    }
  } else if (ctx.city) {
    parts.push(
      `I was looking at ${categoryLabel.toLowerCase()} businesses in ${ctx.city} and came across ${ctx.businessName}. Really liked what I saw.`
    );
  } else {
    parts.push(
      `I came across ${ctx.businessName} and was really impressed with what you've built.`
    );
  }

  // Services hook — reference what they actually do
  if (ctx.services && ctx.services.length > 0) {
    const topService = ctx.services[0];
    const secondService = ctx.services.length > 1 ? ctx.services[1] : null;
    if (secondService) {
      parts.push(
        `I saw you offer ${topService} and ${secondService} — so I built the site around those as your main services.`
      );
    } else {
      parts.push(
        `I noticed ${topService} is a big part of what you do, so I made sure that's front and center on the site.`
      );
    }
  }

  // Current website hook — different pitch based on whether they have one
  if (ctx.currentWebsite) {
    parts.push(
      `I know you already have a website, but I put together a modern version that's fully mobile-optimized and designed to actually show up in Google searches. I think you'll see a real difference.`
    );
  } else {
    parts.push(
      `So here's the thing — I actually went ahead and built a custom website for ${ctx.businessName}. It's free for you to take a look at. Mobile-friendly, shows up in Google, ready to go.`
    );
  }

  // Close — always the same: text with link
  parts.push(
    `I'll shoot you a text with the link so you can check it out on your phone. Takes like 30 seconds to look at. If you love it, awesome. If not, no worries at all. Have a great day!`
  );

  return parts.join(" ");
}

/**
 * Follow-up voicemail — second contact.
 * Shorter, references the first call, adds new value angle.
 */
function generateFollowUpScript(
  ctx: VoicemailContext,
  greeting: string,
  categoryLabel: string
): string {
  const parts: string[] = [];

  parts.push(`${greeting}, it's Ben again from BlueJays.`);
  parts.push(
    `I left you a message a few days ago about the website I built for ${ctx.businessName}.`
  );

  // Add a new angle based on available data
  if (ctx.googleRating && ctx.reviewCount && ctx.reviewCount > 5) {
    parts.push(
      `One thing I wanted to mention — I actually pulled in your ${ctx.googleRating}-star Google rating and featured your reviews right on the homepage. It's a great trust signal for new customers.`
    );
  } else if (ctx.currentWebsite) {
    parts.push(
      `I actually ran a quick comparison between your current site and the one I built. The new one is fully mobile-optimized and loads a lot faster, which makes a big difference for Google rankings.`
    );
  } else if (ctx.city) {
    parts.push(
      `I've been working with a few ${categoryLabel.toLowerCase()} businesses in the ${ctx.city} area, and the ones with a strong website are pulling in way more calls from Google. Just thought you'd want to know.`
    );
  } else {
    parts.push(
      `Just wanted to make sure you got the text with the link. It's a fully custom site, not a template — I built it specifically for ${ctx.businessName}.`
    );
  }

  parts.push(
    `Take 30 seconds to check it out when you get a chance. The link is in the text I sent. No pressure at all. Talk soon!`
  );

  return parts.join(" ");
}

/**
 * Re-engagement voicemail — for prospects who went cold.
 * Different approach: lead with value/insight, not the pitch.
 */
function generateReEngageScript(
  ctx: VoicemailContext,
  greeting: string,
  categoryLabel: string
): string {
  const parts: string[] = [];

  parts.push(`${greeting}, it's Ben from BlueJays. Quick message for you.`);

  // Lead with an insight or value-add, not a pitch
  if (ctx.googleRating && ctx.reviewCount) {
    if (ctx.reviewCount > 20) {
      parts.push(
        `I was thinking about ${ctx.businessName} — you've got ${ctx.reviewCount} reviews on Google, which is more than most ${categoryLabel.toLowerCase()} businesses in your area. That's a real competitive advantage. The website I built for you actually showcases those reviews to turn visitors into callers.`
      );
    } else {
      parts.push(
        `I noticed ${ctx.businessName} has been getting some new reviews on Google lately. That's great — the website I built shows them off so visitors can see them right away.`
      );
    }
  } else if (ctx.services && ctx.services.length > 0) {
    const topService = ctx.services[0];
    parts.push(
      `I was doing some research on ${topService.toLowerCase()} in your area and noticed there's a lot of people searching for it online. The website I built for ${ctx.businessName} is optimized to show up for exactly those searches.`
    );
  } else if (ctx.city) {
    parts.push(
      `I've been seeing a lot of ${categoryLabel.toLowerCase()} businesses in ${ctx.city} invest in their online presence lately. The ones with good websites are pulling ahead. Just wanted to remind you that the site I built for ${ctx.businessName} is still ready to go whenever you are.`
    );
  } else {
    parts.push(
      `I built a website for ${ctx.businessName} a while back and it's still live. I actually made some improvements to it recently — it's looking even better now.`
    );
  }

  // Mobile-friendly hook if they don't have a website or have an old one
  if (!ctx.currentWebsite) {
    parts.push(
      `Right now, when someone searches for ${categoryLabel.toLowerCase()} on their phone in your area, they can't find you. This site changes that.`
    );
  } else {
    parts.push(
      `I checked your current site on my phone the other day, and honestly, the new version I built is a big upgrade in terms of how it looks and works on mobile.`
    );
  }

  parts.push(
    `Anyway, the link is still in the text I sent you. No pressure, just thought it was worth another look. Take care!`
  );

  return parts.join(" ");
}

// ═══════════════════════════════════════════════════════════════
// TWIML GENERATION
// ═══════════════════════════════════════════════════════════════

/**
 * Get the TwiML script for the voicemail.
 * Uses pre-recorded MP3 files hosted at bluejayportfolio.com:
 *   - initial  (Day 2)  → /public/voicemail-initial.mp3
 *   - followUp (Day 18) → /public/voicemail-followup.mp3
 *
 * Falls back to Twilio TTS only if the stage is unrecognized.
 */
export function getVoicemailTwiml(
  businessName: string,
  prospect?: Prospect,
  stage: "initial" | "followUp" = "initial"
): string {
  // Pre-recorded MP3s are live — use them directly.
  const audioUrl =
    stage === "followUp"
      ? `${BASE_URL}/voicemail-followup.mp3`
      : `${BASE_URL}/voicemail-initial.mp3`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Pause length="1"/>
  <Play>${audioUrl}</Play>
</Response>`;
}

/**
 * Generate a personalized TwiML that handles AMD results.
 * - If voicemail: play the message after the beep
 * - If human answers: hang up politely (we only want voicemail)
 */
export function getAmdTwiml(
  amdResult: string,
  businessName: string,
  prospect?: Prospect,
  stage: "initial" | "followUp" = "initial"
): string {
  if (amdResult === "machine_end_beep" || amdResult === "machine_end_silence") {
    // Voicemail detected — play our message
    return getVoicemailTwiml(businessName, prospect, stage);
  }

  // Human answered — hang up (we only want voicemail drops)
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Hangup/>
</Response>`;
}

async function logVoicemailDrop(drop: VoicemailDrop) {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from("voicemail_drops").insert({
        id: drop.id,
        prospect_id: drop.prospectId,
        to_number: drop.to,
        from_number: drop.from,
        status: drop.status,
        sent_at: drop.sentAt,
        script_type: drop.scriptType,
      });
    } catch {
      // Table might not exist yet
    }
  }
  console.log(`  Voicemail drop logged: ${drop.status}`);
}

export function isTwilioVoiceConfigured(): boolean {
  return !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER);
}

// ═══════════════════════════════════════════════════════════════
// LEGACY VOICEMAIL_SCRIPTS — Enhanced with personalization
// Kept for backward compatibility with funnel-manager.ts
// ═══════════════════════════════════════════════════════════════

export const VOICEMAIL_SCRIPTS = {
  /**
   * Initial voicemail — basic version (backward compatible).
   * For personalized version, use generatePersonalizedScript() instead.
   */
  initial: (businessName: string) =>
    `Hey, this is Ben from BlueJays. I came across ${businessName} and was really impressed with what you've built. So I actually went ahead and put together a custom website for you, completely free. No catch. I'll shoot you a text with the link so you can check it out on your phone. If you love it, awesome. If not, no worries at all. Have a great day!`,

  /**
   * Follow-up voicemail — basic version (backward compatible).
   * For personalized version, use generatePersonalizedScript() instead.
   */
  followUp: (businessName: string) =>
    `Hey, this is Ben again from BlueJays. I left you a message a few days ago about the website I built for ${businessName}. Just wanted to make sure you got the text with the link. Take 30 seconds to check it out when you get a chance. No pressure at all. Talk soon!`,

  /**
   * Personalized initial — uses full prospect data for deep personalization.
   */
  personalizedInitial: (prospect: Prospect) => {
    const ctx = extractVoicemailContext(prospect);
    return generatePersonalizedScript(ctx, "initial");
  },

  /**
   * Personalized follow-up — references specific data points.
   */
  personalizedFollowUp: (prospect: Prospect) => {
    const ctx = extractVoicemailContext(prospect);
    return generatePersonalizedScript(ctx, "followUp");
  },

  /**
   * Re-engagement — for cold prospects, leads with insight not pitch.
   */
  personalizedReEngage: (prospect: Prospect) => {
    const ctx = extractVoicemailContext(prospect);
    return generatePersonalizedScript(ctx, "reEngage");
  },
};

/**
 * Get the best voicemail script for a prospect based on their funnel stage.
 * Uses full personalization when prospect data is available.
 */
export function getBestVoicemailScript(
  prospect: Prospect,
  stage: "initial" | "followUp" | "reEngage" = "initial"
): string {
  const ctx = extractVoicemailContext(prospect);
  return generatePersonalizedScript(ctx, stage);
}
