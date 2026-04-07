import type { Category } from "./types";

/**
 * AI Best Time to Send Engine
 *
 * Based on industry research for when business owners check email/texts.
 * Over time, this should be updated with actual open/click data.
 */

interface SendWindow {
  bestHour: number; // 0-23
  bestDay: string; // "monday", "tuesday", etc.
  secondBestHour: number;
  avoidHours: number[];
  notes: string;
}

const INDUSTRY_SEND_TIMES: Partial<Record<Category, SendWindow>> = {
  "real-estate": {
    bestHour: 7, bestDay: "tuesday",
    secondBestHour: 17, avoidHours: [12, 13, 22, 23, 0, 1, 2, 3, 4, 5],
    notes: "Agents check email early morning before showings and evening after. Avoid lunch — they're at open houses.",
  },
  "dental": {
    bestHour: 7, bestDay: "monday",
    secondBestHour: 12, avoidHours: [8, 9, 10, 11, 14, 15, 16, 22, 23, 0, 1, 2, 3, 4, 5],
    notes: "Dentists check email before patients arrive (7am) or at lunch. During business hours they're with patients.",
  },
  "law-firm": {
    bestHour: 21, bestDay: "wednesday",
    secondBestHour: 7, avoidHours: [9, 10, 11, 14, 15, 22, 23, 0, 1, 2, 3, 4, 5],
    notes: "Lawyers work late. Evening emails get read. Morning before court also works.",
  },
  "landscaping": {
    bestHour: 6, bestDay: "monday",
    secondBestHour: 19, avoidHours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 22, 23, 0, 1, 2, 3, 4, 5],
    notes: "Landscapers are in the field all day. Very early morning or after work is best.",
  },
  "salon": {
    bestHour: 10, bestDay: "sunday",
    secondBestHour: 20, avoidHours: [11, 12, 13, 14, 15, 16, 17, 22, 23, 0, 1, 2, 3, 4, 5],
    notes: "Salon owners check social/email on slow mornings (Mon/Sun). Evenings after closing also work.",
  },
  "plumber": {
    bestHour: 6, bestDay: "monday",
    secondBestHour: 19, avoidHours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    notes: "Trade workers are busy during the day. Very early or evening only.",
  },
  "electrician": {
    bestHour: 6, bestDay: "monday",
    secondBestHour: 19, avoidHours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    notes: "Similar to plumbers — before/after work hours.",
  },
};

const DEFAULT_SEND_WINDOW: SendWindow = {
  bestHour: 8, bestDay: "tuesday",
  secondBestHour: 18, avoidHours: [22, 23, 0, 1, 2, 3, 4, 5],
  notes: "General best practice: early morning or early evening on weekdays.",
};

export function getBestSendTime(category: Category): SendWindow {
  return INDUSTRY_SEND_TIMES[category] || DEFAULT_SEND_WINDOW;
}

export function isGoodTimeToSend(category: Category): boolean {
  const window = getBestSendTime(category);
  const now = new Date();
  const hour = now.getHours();
  return !window.avoidHours.includes(hour);
}

export function getNextBestSendTime(category: Category): Date {
  const window = getBestSendTime(category);
  const now = new Date();
  const next = new Date(now);

  // Set to best hour today
  next.setHours(window.bestHour, 0, 0, 0);

  // If that time has passed, try second best
  if (next <= now) {
    next.setHours(window.secondBestHour, 0, 0, 0);
  }

  // If both passed, go to tomorrow's best hour
  if (next <= now) {
    next.setDate(next.getDate() + 1);
    next.setHours(window.bestHour, 0, 0, 0);
  }

  return next;
}
