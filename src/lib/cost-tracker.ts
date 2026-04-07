import { getEmailHistory } from "./email-sender";
import { getSmsHistory } from "./sms";

/**
 * Cost Tracking System
 *
 * Tracks approximate costs per lead and overall system costs.
 * Helps Ben understand ROI and optimize spending.
 */

// Approximate costs per service (adjust as needed)
export const COST_RATES = {
  // SendGrid
  emailCost: 0.001, // ~$1 per 1000 emails on free/essentials plan

  // Twilio
  smsCost: 0.0079, // $0.0079 per SMS segment
  callCost: 0.014, // $0.014 per minute (outbound)

  // AI APIs (when connected)
  claudePerRequest: 0.003, // ~$0.003 per response (Haiku) or $0.015 (Sonnet)
  perplexityPerSearch: 0.005, // ~$5 per 1000 searches

  // Infrastructure
  vercelMonthly: 0, // Free tier
  supabaseMonthly: 0, // Free tier
  sendgridMonthly: 0, // Free tier (100 emails/day)
  twilioMonthly: 1.15, // $1.15/month for phone number + per-use

  // Google Places API (when connected)
  googlePlacesPerSearch: 0.017, // $17 per 1000 searches
};

export interface LeadCost {
  prospectId: string;
  businessName: string;
  emailCost: number;
  smsCost: number;
  aiCost: number;
  scrapingCost: number;
  totalCost: number;
  emailCount: number;
  smsCount: number;
}

export interface SystemCost {
  totalEmailsSent: number;
  totalSmsSent: number;
  totalLeads: number;
  estimatedEmailCost: number;
  estimatedSmsCost: number;
  estimatedAiCost: number;
  estimatedInfraCost: number;
  totalEstimatedCost: number;
  costPerLead: number;
  revenuePerSale: number;
  breakEvenLeads: number;
}

export async function getLeadCost(
  prospectId: string,
  businessName: string
): Promise<LeadCost> {
  const emails = await getEmailHistory(prospectId);
  const sms = await getSmsHistory(prospectId);

  const emailCost = emails.length * COST_RATES.emailCost;
  const smsCost = sms.length * COST_RATES.smsCost;
  const aiCost = COST_RATES.claudePerRequest * 2; // quality review + AI responder
  const scrapingCost = COST_RATES.googlePlacesPerSearch; // one search to find them

  return {
    prospectId,
    businessName,
    emailCost: Math.round(emailCost * 1000) / 1000,
    smsCost: Math.round(smsCost * 1000) / 1000,
    aiCost: Math.round(aiCost * 1000) / 1000,
    scrapingCost: Math.round(scrapingCost * 1000) / 1000,
    totalCost: Math.round((emailCost + smsCost + aiCost + scrapingCost) * 1000) / 1000,
    emailCount: emails.length,
    smsCount: sms.length,
  };
}

export function getSystemCostEstimate(
  totalLeads: number,
  totalEmails: number,
  totalSms: number,
): SystemCost {
  const emailCost = totalEmails * COST_RATES.emailCost;
  const smsCost = totalSms * COST_RATES.smsCost;
  const aiCost = totalLeads * COST_RATES.claudePerRequest * 2;
  const infraCost = COST_RATES.twilioMonthly + COST_RATES.vercelMonthly + COST_RATES.supabaseMonthly + COST_RATES.sendgridMonthly;
  const totalCost = emailCost + smsCost + aiCost + infraCost;
  const costPerLead = totalLeads > 0 ? totalCost / totalLeads : 0;

  return {
    totalEmailsSent: totalEmails,
    totalSmsSent: totalSms,
    totalLeads,
    estimatedEmailCost: Math.round(emailCost * 100) / 100,
    estimatedSmsCost: Math.round(smsCost * 100) / 100,
    estimatedAiCost: Math.round(aiCost * 100) / 100,
    estimatedInfraCost: Math.round(infraCost * 100) / 100,
    totalEstimatedCost: Math.round(totalCost * 100) / 100,
    costPerLead: Math.round(costPerLead * 100) / 100,
    revenuePerSale: 997,
    breakEvenLeads: totalCost > 0 ? Math.ceil(totalCost / 997) : 0,
  };
}
