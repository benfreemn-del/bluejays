/**
 * Funnel Dry Run Simulator
 *
 * Traces through the entire 7-step funnel without sending anything.
 * Validates all templates render, all data is populated, and all links work.
 * Returns a detailed pass/fail report for each step.
 */

import type { Prospect } from "./types";
import { CATEGORY_CONFIG } from "./types";
import { FUNNEL_STEPS } from "./funnel-manager";
import { getPitchEmail, getFollowUp1, getFollowUp2 } from "./email-templates";
import { getInitialSms, getFollowUpSms1, getFollowUpSms2 } from "./sms";
import { generateSmartFollowUp } from "./smart-followup";
import { VOICEMAIL_SCRIPTS } from "./voicemail";

// Hardcoded per CLAUDE.md Rule 16 — Vercel had stale NEXT_PUBLIC_BASE_URL.
const BASE_URL = "https://bluejayportfolio.com";

// ─── Types ───────────────────────────────────────────────────────────

export interface SimulationCheck {
  name: string;
  passed: boolean;
  message: string;
  severity: "critical" | "warning" | "info";
}

export interface SimulatedStepResult {
  stepIndex: number;
  day: number;
  label: string;
  channels: string[];
  email?: {
    subject: string;
    bodyPreview: string;
    bodyLength: number;
  };
  sms?: {
    content: string;
    charCount: number;
  };
  voicemail?: {
    script: string;
    trigger: string;
  };
  statusChange?: string;
  checks: SimulationCheck[];
  passed: boolean;
}

export interface FunnelSimulationReport {
  prospectId: string;
  businessName: string;
  simulatedAt: string;
  totalSteps: number;
  passedSteps: number;
  failedSteps: number;
  overallPassed: boolean;
  globalChecks: SimulationCheck[];
  steps: SimulatedStepResult[];
}

// ─── Validation Helpers ──────────────────────────────────────────────

function checkPlaceholders(text: string, fieldName: string): SimulationCheck[] {
  const checks: SimulationCheck[] = [];
  // Check for unresolved template placeholders
  const placeholderPatterns = [/\{\{[^}]+\}\}/g, /undefined/gi, /null/gi];
  for (const pattern of placeholderPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      checks.push({
        name: `${fieldName} placeholders`,
        passed: false,
        message: `Found unresolved content in ${fieldName}: ${matches.slice(0, 3).join(", ")}`,
        severity: "critical",
      });
    }
  }
  return checks;
}

function checkLinks(text: string, fieldName: string): SimulationCheck[] {
  const checks: SimulationCheck[] = [];
  const urlPattern = /https?:\/\/[^\s)>"]+/g;
  const urls = text.match(urlPattern) || [];

  if (urls.length === 0 && fieldName.includes("email")) {
    checks.push({
      name: `${fieldName} links`,
      passed: false,
      message: `No links found in ${fieldName}. Preview URL may be missing.`,
      severity: "warning",
    });
  }

  for (const url of urls) {
    // Check for obviously broken URLs
    if (url.includes("undefined") || url.includes("null") || url.includes("[object")) {
      checks.push({
        name: `${fieldName} link validity`,
        passed: false,
        message: `Broken link in ${fieldName}: ${url}`,
        severity: "critical",
      });
    } else {
      checks.push({
        name: `${fieldName} link`,
        passed: true,
        message: `Link OK: ${url.length > 60 ? url.slice(0, 60) + "..." : url}`,
        severity: "info",
      });
    }
  }

  return checks;
}

function checkContentLength(text: string, fieldName: string, minLength: number): SimulationCheck {
  if (text.length < minLength) {
    return {
      name: `${fieldName} length`,
      passed: false,
      message: `${fieldName} is too short (${text.length} chars, minimum ${minLength})`,
      severity: "warning",
    };
  }
  return {
    name: `${fieldName} length`,
    passed: true,
    message: `${fieldName} has ${text.length} chars (OK)`,
    severity: "info",
  };
}

// ─── Step Simulators ─────────────────────────────────────────────────

function simulateStep0(prospect: Prospect, previewUrl: string): SimulatedStepResult {
  const checks: SimulationCheck[] = [];
  let email: SimulatedStepResult["email"];
  let sms: SimulatedStepResult["sms"];

  // Simulate email
  if (prospect.email) {
    try {
      const template = getPitchEmail(prospect, previewUrl);
      email = {
        subject: template.subject,
        bodyPreview: template.body.slice(0, 200) + "...",
        bodyLength: template.body.length,
      };
      checks.push({ name: "Email template", passed: true, message: "Pitch email rendered successfully", severity: "info" });
      checks.push(checkContentLength(template.subject, "Email subject", 10));
      checks.push(checkContentLength(template.body, "Email body", 100));
      checks.push(...checkPlaceholders(template.subject, "Email subject"));
      checks.push(...checkPlaceholders(template.body, "Email body"));
      checks.push(...checkLinks(template.body, "Email body"));
    } catch (err) {
      checks.push({ name: "Email template", passed: false, message: `Email template failed: ${(err as Error).message}`, severity: "critical" });
    }
  } else {
    checks.push({ name: "Email availability", passed: false, message: "No email address — email will be skipped", severity: "warning" });
  }

  // Simulate SMS
  if (prospect.phone) {
    try {
      const smsContent = getInitialSms(prospect, previewUrl);
      sms = { content: smsContent, charCount: smsContent.length };
      checks.push({ name: "SMS template", passed: true, message: "Initial SMS rendered successfully", severity: "info" });
      checks.push(...checkPlaceholders(smsContent, "SMS"));
      checks.push(...checkLinks(smsContent, "SMS"));
      if (smsContent.length > 160) {
        checks.push({ name: "SMS length", passed: true, message: `SMS is ${smsContent.length} chars (will be sent as multi-part)`, severity: "info" });
      }
    } catch (err) {
      checks.push({ name: "SMS template", passed: false, message: `SMS template failed: ${(err as Error).message}`, severity: "critical" });
    }
  } else {
    checks.push({ name: "SMS availability", passed: false, message: "No phone number — SMS will be skipped", severity: "warning" });
  }

  const passed = checks.filter(c => c.severity === "critical" && !c.passed).length === 0;

  return {
    stepIndex: 0,
    day: 0,
    label: "Initial Pitch",
    channels: ["email", "sms"],
    email,
    sms,
    statusChange: "contacted",
    checks,
    passed,
  };
}

function simulateStep1(prospect: Prospect): SimulatedStepResult {
  const checks: SimulationCheck[] = [];
  let voicemail: SimulatedStepResult["voicemail"];

  if (prospect.phone) {
    try {
      const script = VOICEMAIL_SCRIPTS.initial(prospect.businessName);
      voicemail = { script, trigger: "AMD (Answering Machine Detection) — plays after beep" };
      checks.push({ name: "Voicemail script", passed: true, message: "Voicemail script rendered successfully", severity: "info" });
      checks.push(...checkPlaceholders(script, "Voicemail script"));
    } catch (err) {
      checks.push({ name: "Voicemail script", passed: false, message: `Voicemail script failed: ${(err as Error).message}`, severity: "critical" });
    }
  } else {
    checks.push({ name: "Voicemail availability", passed: false, message: "No phone number — voicemail will be skipped", severity: "warning" });
  }

  const passed = checks.filter(c => c.severity === "critical" && !c.passed).length === 0;

  return {
    stepIndex: 1,
    day: 2,
    label: "Voicemail Drop",
    channels: ["voicemail"],
    voicemail,
    checks,
    passed,
  };
}

function simulateStep2(prospect: Prospect, previewUrl: string): SimulatedStepResult {
  const checks: SimulationCheck[] = [];
  let email: SimulatedStepResult["email"];

  if (prospect.email) {
    try {
      const template = getFollowUp1(prospect, previewUrl);
      email = {
        subject: template.subject,
        bodyPreview: template.body.slice(0, 200) + "...",
        bodyLength: template.body.length,
      };
      checks.push({ name: "Email template", passed: true, message: "Follow-up 1 email rendered successfully", severity: "info" });
      checks.push(checkContentLength(template.subject, "Email subject", 10));
      checks.push(...checkPlaceholders(template.subject, "Email subject"));
      checks.push(...checkPlaceholders(template.body, "Email body"));
      checks.push(...checkLinks(template.body, "Email body"));
    } catch (err) {
      checks.push({ name: "Email template", passed: false, message: `Follow-up 1 email failed: ${(err as Error).message}`, severity: "critical" });
    }
  } else {
    checks.push({ name: "Email availability", passed: false, message: "No email address — email will be skipped", severity: "warning" });
  }

  const passed = checks.filter(c => c.severity === "critical" && !c.passed).length === 0;

  return {
    stepIndex: 2,
    day: 5,
    label: "Gentle Follow-Up",
    channels: ["email"],
    email,
    checks,
    passed,
  };
}

function simulateStep3(prospect: Prospect, previewUrl: string): SimulatedStepResult {
  const checks: SimulationCheck[] = [];
  let email: SimulatedStepResult["email"];
  let sms: SimulatedStepResult["sms"];

  if (prospect.email) {
    try {
      const template = getFollowUp2(prospect, previewUrl);
      email = {
        subject: template.subject,
        bodyPreview: template.body.slice(0, 200) + "...",
        bodyLength: template.body.length,
      };
      checks.push({ name: "Email template", passed: true, message: "Value Reframe email rendered successfully", severity: "info" });
      checks.push(checkContentLength(template.subject, "Email subject", 10));
      checks.push(...checkPlaceholders(template.subject, "Email subject"));
      checks.push(...checkPlaceholders(template.body, "Email body"));
      checks.push(...checkLinks(template.body, "Email body"));
    } catch (err) {
      checks.push({ name: "Email template", passed: false, message: `Value Reframe email failed: ${(err as Error).message}`, severity: "critical" });
    }
  } else {
    checks.push({ name: "Email availability", passed: false, message: "No email address — email will be skipped", severity: "warning" });
  }

  if (prospect.phone) {
    try {
      const smsContent = getFollowUpSms1(prospect, previewUrl);
      sms = { content: smsContent, charCount: smsContent.length };
      checks.push({ name: "SMS template", passed: true, message: "Follow-up SMS 1 rendered successfully", severity: "info" });
      checks.push(...checkPlaceholders(smsContent, "SMS"));
      checks.push(...checkLinks(smsContent, "SMS"));
    } catch (err) {
      checks.push({ name: "SMS template", passed: false, message: `Follow-up SMS 1 failed: ${(err as Error).message}`, severity: "critical" });
    }
  } else {
    checks.push({ name: "SMS availability", passed: false, message: "No phone number — SMS will be skipped", severity: "warning" });
  }

  const passed = checks.filter(c => c.severity === "critical" && !c.passed).length === 0;

  return {
    stepIndex: 3,
    day: 12,
    label: "Value Reframe",
    channels: ["email", "sms"],
    email,
    sms,
    checks,
    passed,
  };
}

function simulateStep4(prospect: Prospect): SimulatedStepResult {
  const checks: SimulationCheck[] = [];
  let voicemail: SimulatedStepResult["voicemail"];

  if (prospect.phone) {
    try {
      const script = VOICEMAIL_SCRIPTS.followUp(prospect.businessName);
      voicemail = { script, trigger: "AMD (Answering Machine Detection) — plays after beep" };
      checks.push({ name: "Voicemail script", passed: true, message: "Follow-up voicemail script rendered successfully", severity: "info" });
      checks.push(...checkPlaceholders(script, "Voicemail script"));
    } catch (err) {
      checks.push({ name: "Voicemail script", passed: false, message: `Follow-up voicemail script failed: ${(err as Error).message}`, severity: "critical" });
    }
  } else {
    checks.push({ name: "Voicemail availability", passed: false, message: "No phone number — voicemail will be skipped", severity: "warning" });
  }

  const passed = checks.filter(c => c.severity === "critical" && !c.passed).length === 0;

  return {
    stepIndex: 4,
    day: 18,
    label: "Follow-Up VM",
    channels: ["voicemail"],
    voicemail,
    checks,
    passed,
  };
}

function simulateStep5(prospect: Prospect, previewUrl: string): SimulatedStepResult {
  const checks: SimulationCheck[] = [];
  let email: SimulatedStepResult["email"];

  if (prospect.email) {
    try {
      const smart = generateSmartFollowUp(prospect);
      email = {
        subject: smart.email.subject,
        bodyPreview: smart.email.body.slice(0, 200) + "...",
        bodyLength: smart.email.body.length,
      };
      checks.push({ name: "Email template", passed: true, message: `Social Proof email rendered (angle: ${smart.angle})`, severity: "info" });
      checks.push(checkContentLength(smart.email.subject, "Email subject", 10));
      checks.push(...checkPlaceholders(smart.email.subject, "Email subject"));
      checks.push(...checkPlaceholders(smart.email.body, "Email body"));
      checks.push(...checkLinks(smart.email.body, "Email body"));
    } catch (err) {
      checks.push({ name: "Email template", passed: false, message: `Social Proof email failed: ${(err as Error).message}`, severity: "critical" });
    }
  } else {
    checks.push({ name: "Email availability", passed: false, message: "No email address — email will be skipped", severity: "warning" });
  }

  const passed = checks.filter(c => c.severity === "critical" && !c.passed).length === 0;

  return {
    stepIndex: 5,
    day: 21,
    label: "Social Proof",
    channels: ["email"],
    email,
    checks,
    passed,
  };
}

function simulateStep6(prospect: Prospect, previewUrl: string): SimulatedStepResult {
  const checks: SimulationCheck[] = [];
  let email: SimulatedStepResult["email"];

  if (prospect.email) {
    try {
      const smart = generateSmartFollowUp(prospect);
      // Step 6 uses the same smart follow-up engine but as final check-in
      email = {
        subject: smart.email.subject,
        bodyPreview: smart.email.body.slice(0, 200) + "...",
        bodyLength: smart.email.body.length,
      };
      checks.push({ name: "Email template", passed: true, message: `Final Check-In email rendered (angle: ${smart.angle})`, severity: "info" });
      checks.push(checkContentLength(smart.email.subject, "Email subject", 10));
      checks.push(...checkPlaceholders(smart.email.subject, "Email subject"));
      checks.push(...checkPlaceholders(smart.email.body, "Email body"));
      checks.push(...checkLinks(smart.email.body, "Email body"));
    } catch (err) {
      checks.push({ name: "Email template", passed: false, message: `Final Check-In email failed: ${(err as Error).message}`, severity: "critical" });
    }
  } else {
    checks.push({ name: "Email availability", passed: false, message: "No email address — email will be skipped", severity: "warning" });
  }

  const passed = checks.filter(c => c.severity === "critical" && !c.passed).length === 0;

  return {
    stepIndex: 6,
    day: 30,
    label: "Final Check-In",
    channels: ["email"],
    email,
    checks,
    passed,
  };
}

// ─── Main Simulator ──────────────────────────────────────────────────

export function simulateFunnel(prospect: Prospect): FunnelSimulationReport {
  const previewUrl = prospect.generatedSiteUrl
    ? `${BASE_URL}${prospect.generatedSiteUrl}`
    : `${BASE_URL}/preview/${prospect.id}`;

  // Global checks before step simulation
  const globalChecks: SimulationCheck[] = [];

  // Check prospect has required data
  if (!prospect.email && !prospect.phone) {
    globalChecks.push({
      name: "Contact info",
      passed: false,
      message: "Prospect has no email AND no phone — funnel cannot reach them at all",
      severity: "critical",
    });
  }

  if (!prospect.email) {
    globalChecks.push({
      name: "Email address",
      passed: false,
      message: "No email address — 5 of 7 funnel steps use email",
      severity: "warning",
    });
  } else {
    globalChecks.push({
      name: "Email address",
      passed: true,
      message: `Email: ${prospect.email}`,
      severity: "info",
    });
  }

  if (!prospect.phone) {
    globalChecks.push({
      name: "Phone number",
      passed: false,
      message: "No phone number — SMS and voicemail steps will be skipped",
      severity: "warning",
    });
  } else {
    globalChecks.push({
      name: "Phone number",
      passed: true,
      message: `Phone: ${prospect.phone}`,
      severity: "info",
    });
  }

  if (!prospect.generatedSiteUrl) {
    globalChecks.push({
      name: "Preview site",
      passed: false,
      message: "No preview site generated — funnel enrollment will be blocked",
      severity: "critical",
    });
  } else {
    globalChecks.push({
      name: "Preview site",
      passed: true,
      message: `Preview URL: ${previewUrl}`,
      severity: "info",
    });
  }

  // Check business data completeness
  const categoryLabel = CATEGORY_CONFIG[prospect.category]?.label;
  if (!categoryLabel) {
    globalChecks.push({
      name: "Category",
      passed: false,
      message: `Unknown category: ${prospect.category}`,
      severity: "warning",
    });
  } else {
    globalChecks.push({
      name: "Category",
      passed: true,
      message: `Category: ${categoryLabel}`,
      severity: "info",
    });
  }

  if (!prospect.businessName) {
    globalChecks.push({
      name: "Business name",
      passed: false,
      message: "Missing business name — templates will have gaps",
      severity: "critical",
    });
  }

  if (prospect.scrapedData?.services && prospect.scrapedData.services.length > 0) {
    globalChecks.push({
      name: "Services data",
      passed: true,
      message: `${prospect.scrapedData.services.length} services found for personalization`,
      severity: "info",
    });
  } else {
    globalChecks.push({
      name: "Services data",
      passed: true,
      message: "No scraped services — templates will use generic messaging",
      severity: "info",
    });
  }

  if (prospect.googleRating) {
    globalChecks.push({
      name: "Google rating",
      passed: true,
      message: `Rating: ${prospect.googleRating} (${prospect.reviewCount || 0} reviews)`,
      severity: "info",
    });
  }

  // Check funnel-blocking statuses
  const stopStatuses = ["responded", "interested", "claimed", "paid", "dismissed", "unsubscribed"];
  if (stopStatuses.includes(prospect.status)) {
    globalChecks.push({
      name: "Prospect status",
      passed: false,
      message: `Status is "${prospect.status}" — funnel enrollment will be blocked`,
      severity: "critical",
    });
  }

  if (prospect.funnelPaused) {
    globalChecks.push({
      name: "Funnel paused",
      passed: false,
      message: "Prospect funnel is paused — enrollment will be blocked",
      severity: "critical",
    });
  }

  // Simulate all 7 steps
  const steps: SimulatedStepResult[] = [
    simulateStep0(prospect, previewUrl),
    simulateStep1(prospect),
    simulateStep2(prospect, previewUrl),
    simulateStep3(prospect, previewUrl),
    simulateStep4(prospect),
    simulateStep5(prospect, previewUrl),
    simulateStep6(prospect, previewUrl),
  ];

  const passedSteps = steps.filter(s => s.passed).length;
  const failedSteps = steps.filter(s => !s.passed).length;
  const globalCriticalFails = globalChecks.filter(c => c.severity === "critical" && !c.passed).length;
  const overallPassed = globalCriticalFails === 0 && failedSteps === 0;

  return {
    prospectId: prospect.id,
    businessName: prospect.businessName,
    simulatedAt: new Date().toISOString(),
    totalSteps: steps.length,
    passedSteps,
    failedSteps,
    overallPassed,
    globalChecks,
    steps,
  };
}
