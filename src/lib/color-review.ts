import type { Category } from "./types";

export interface ColorReviewResult {
  passed: boolean;
  score: number;
  issues: string[];
  suggestion?: {
    accentColor: string;
    reason: string;
  };
}

// Vibrant, proven color palettes per category
const RECOMMENDED_COLORS: Record<string, { primary: string; alternatives: string[]; vibe: string }> = {
  "real-estate": { primary: "#c8a45e", alternatives: ["#d4a843", "#b8860b", "#daa520"], vibe: "luxury gold — prestigious, trustworthy" },
  "dental": { primary: "#10b981", alternatives: ["#059669", "#34d399", "#06d6a0"], vibe: "clean green — fresh, healthy, calming" },
  "law-firm": { primary: "#8b5cf6", alternatives: ["#7c3aed", "#6d28d9", "#a78bfa"], vibe: "authoritative purple — power, wisdom, trust" },
  "landscaping": { primary: "#22c55e", alternatives: ["#16a34a", "#4ade80", "#15803d"], vibe: "nature green — growth, vitality, outdoors" },
  "salon": { primary: "#ec4899", alternatives: ["#f472b6", "#db2777", "#e11d48"], vibe: "vibrant pink — luxury, beauty, creativity" },
  "electrician": { primary: "#f59e0b", alternatives: ["#eab308", "#fbbf24", "#f97316"], vibe: "electric amber — energy, safety, power" },
  "plumber": { primary: "#3b82f6", alternatives: ["#2563eb", "#60a5fa", "#0ea5e9"], vibe: "water blue — clean, reliable, professional" },
  "hvac": { primary: "#06b6d4", alternatives: ["#0891b2", "#22d3ee", "#67e8f9"], vibe: "cool cyan — comfort, climate, technology" },
  "roofing": { primary: "#d97706", alternatives: ["#b45309", "#f59e0b", "#ea580c"], vibe: "warm amber — strong, reliable, durable" },
  "auto-repair": { primary: "#ef4444", alternatives: ["#dc2626", "#f87171", "#b91c1c"], vibe: "bold red — power, speed, attention" },
  "fitness": { primary: "#f43f5e", alternatives: ["#e11d48", "#fb7185", "#be123c"], vibe: "energetic rose — passion, energy, strength" },
  "veterinary": { primary: "#34d399", alternatives: ["#10b981", "#6ee7b7", "#059669"], vibe: "warm green — caring, natural, gentle" },
  "photography": { primary: "#a855f7", alternatives: ["#9333ea", "#c084fc", "#7c3aed"], vibe: "creative purple — artistic, unique, premium" },
  "accounting": { primary: "#6366f1", alternatives: ["#4f46e5", "#818cf8", "#4338ca"], vibe: "professional indigo — trustworthy, precise, smart" },
  "tattoo": { primary: "#a3a3a3", alternatives: ["#d4d4d4", "#737373", "#e5e5e5"], vibe: "silver grey — edgy, artistic, bold" },
  "florist": { primary: "#fb7185", alternatives: ["#f43f5e", "#fda4af", "#e11d48"], vibe: "rose pink — romantic, natural, beautiful" },
  "catering": { primary: "#fb923c", alternatives: ["#f97316", "#fdba74", "#ea580c"], vibe: "warm orange — appetizing, festive, inviting" },
  "daycare": { primary: "#60a5fa", alternatives: ["#3b82f6", "#93c5fd", "#2563eb"], vibe: "soft blue — safe, calming, cheerful" },
};

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function reviewColorScheme(
  accentColor: string,
  category: Category
): ColorReviewResult {
  const issues: string[] = [];
  let score = 100;

  const hsl = hexToHsl(accentColor);
  const recommended = RECOMMENDED_COLORS[category];

  // Check saturation — dull colors are bad
  if (hsl.s < 30) {
    issues.push(`Color is too desaturated (${hsl.s}% saturation). Needs more vibrancy.`);
    score -= 25;
  } else if (hsl.s < 50) {
    issues.push(`Color saturation is moderate (${hsl.s}%). Consider boosting for more punch.`);
    score -= 10;
  }

  // Check lightness — too dark or too light
  if (hsl.l < 20) {
    issues.push(`Color is too dark (${hsl.l}% lightness). Will disappear on dark backgrounds.`);
    score -= 30;
  } else if (hsl.l > 80) {
    issues.push(`Color is too light (${hsl.l}% lightness). Won't contrast well on light elements.`);
    score -= 20;
  }

  // Check if it matches the category vibe
  if (recommended) {
    const recHsl = hexToHsl(recommended.primary);
    const hueDiff = Math.abs(hsl.h - recHsl.h);
    if (hueDiff > 60 && hueDiff < 300) {
      issues.push(`Hue (${hsl.h}°) is far from recommended for ${category} (${recHsl.h}°). ${recommended.vibe}`);
      score -= 15;
    }
  }

  // Check contrast against dark background (#0a0a0a)
  if (hsl.l < 35 && hsl.s < 60) {
    issues.push("Low visibility against dark backgrounds. Bump lightness or saturation.");
    score -= 20;
  }

  score = Math.max(0, Math.min(100, score));

  const result: ColorReviewResult = {
    passed: score >= 70 && issues.length < 2,
    score,
    issues,
  };

  // Suggest a better color if score is low
  if (!result.passed && recommended) {
    result.suggestion = {
      accentColor: recommended.primary,
      reason: `Recommended: ${recommended.primary} — ${recommended.vibe}`,
    };
  }

  return result;
}

export function getBestColorForCategory(category: Category): string {
  return RECOMMENDED_COLORS[category]?.primary || "#0ea5e9";
}

export function getColorAlternatives(category: Category): string[] {
  return RECOMMENDED_COLORS[category]?.alternatives || ["#0ea5e9", "#3b82f6", "#06b6d4"];
}
