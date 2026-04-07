import type { Category } from "./types";
import { CATEGORY_CONFIG } from "./types";

/**
 * Logo Generator
 *
 * Creates SVG logos for businesses that don't have one.
 * Each logo is industry-specific with the business name
 * and a relevant icon. These get embedded directly into
 * the generated preview site.
 *
 * Logo styles:
 * - Icon above text (stacked)
 * - Icon left of text (horizontal)
 * - Text-only with accent styling
 * - Monogram (initials in a shape)
 */

export type LogoStyle = "stacked" | "horizontal" | "text-only" | "monogram";

export interface GeneratedLogo {
  svg: string;
  style: LogoStyle;
  width: number;
  height: number;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => w.length > 2 && w[0] === w[0].toUpperCase())
    .map((w) => w[0])
    .slice(0, 3)
    .join("");
}

function getCategoryIcon(category: Category): string {
  const icons: Record<string, string> = {
    "real-estate": '<path d="M50 15 L15 40 L15 80 L85 80 L85 40Z M40 80 L40 55 L60 55 L60 80" stroke-width="2.5"/>',
    "dental": '<path d="M50 20 C38 20 28 30 28 42 L28 60 C28 72 38 82 50 85 C62 82 72 72 72 60 L72 42 C72 30 62 20 50 20Z" stroke-width="2.5"/><circle cx="42" cy="45" r="3" fill="currentColor"/><circle cx="58" cy="45" r="3" fill="currentColor"/>',
    "law-firm": '<path d="M50 15 L50 75 M30 75 L70 75 M25 30 L75 30 M25 30 L15 50 L35 50Z M75 30 L65 50 L85 50Z" stroke-width="2.5"/>',
    "landscaping": '<path d="M50 15 C35 15 25 30 25 45 C25 60 35 70 50 75 C65 70 75 60 75 45 C75 30 65 15 50 15Z M50 15 L50 85 M35 65 L50 50 L65 65" stroke-width="2.5"/>',
    "salon": '<path d="M30 25 C15 25 15 45 30 45 C35 45 37 40 35 35 L65 70 M70 25 C85 25 85 45 70 45 C65 45 63 40 65 35 L35 70" stroke-width="2.5"/>',
    "electrician": '<path d="M55 10 L30 45 L45 45 L40 90 L70 50 L55 50Z" stroke-width="2.5"/>',
    "plumber": '<path d="M35 30 L35 55 C35 65 42 72 50 72 C58 72 65 65 65 55 L65 30 M25 30 L75 30 M45 72 L45 85 L55 85 L55 72" stroke-width="2.5"/>',
    "hvac": '<path d="M50 15 L50 85 M15 50 L85 50 M25 25 L75 75 M75 25 L25 75" stroke-width="2" opacity="0.5"/><circle cx="50" cy="50" r="20" stroke-width="2.5"/><circle cx="50" cy="50" r="8" stroke-width="2"/>',
    "roofing": '<path d="M10 55 L50 20 L90 55 M20 50 L20 80 L80 80 L80 50" stroke-width="2.5"/><path d="M35 80 L35 60 L50 48 L65 60 L65 80" stroke-width="2"/>',
    "auto-repair": '<circle cx="50" cy="50" r="30" stroke-width="2.5"/><circle cx="50" cy="50" r="12" stroke-width="2"/><path d="M50 20 L50 27 M50 73 L50 80 M20 50 L27 50 M73 50 L80 50 M29 29 L34 34 M66 66 L71 71 M71 29 L66 34 M34 66 L29 71" stroke-width="2.5"/>',
    "fitness": '<path d="M20 50 L30 50 L30 30 L38 30 L38 70 L30 70 L30 50 M80 50 L70 50 L70 30 L62 30 L62 70 L70 70 L70 50 M38 45 L62 45 M38 55 L62 55" stroke-width="2.5"/>',
    "veterinary": '<path d="M50 75 C50 75 25 55 25 40 C25 30 35 22 45 28 L50 32 L55 28 C65 22 75 30 75 40 C75 55 50 75 50 75Z" stroke-width="2.5"/>',
  };
  return icons[category] || icons["real-estate"];
}

export function generateLogo(
  businessName: string,
  category: Category,
  style: LogoStyle = "stacked"
): GeneratedLogo {
  const config = CATEGORY_CONFIG[category];
  const color = config?.accentColor || "#0ea5e9";
  const initials = getInitials(businessName);
  const icon = getCategoryIcon(category);

  switch (style) {
    case "monogram":
      return {
        style: "monogram",
        width: 200,
        height: 200,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${color}"/>
              <stop offset="100%" style="stop-color:${darken(color, 30)}"/>
            </linearGradient>
          </defs>
          <rect x="10" y="10" width="180" height="180" rx="30" fill="none" stroke="url(#logoGrad)" stroke-width="4"/>
          <text x="100" y="115" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="72" font-weight="800" fill="${color}" letter-spacing="-2">${initials}</text>
        </svg>`,
      };

    case "horizontal":
      return {
        style: "horizontal",
        width: 400,
        height: 80,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 80" width="400" height="80">
          <g transform="translate(5,5) scale(0.7)" fill="none" stroke="${color}">${icon}</g>
          <text x="85" y="35" font-family="system-ui,-apple-system,sans-serif" font-size="22" font-weight="800" fill="white" letter-spacing="-0.5">${businessName.split(" ").slice(0, 2).join(" ")}</text>
          <text x="85" y="58" font-family="system-ui,-apple-system,sans-serif" font-size="14" font-weight="400" fill="${color}" letter-spacing="3" text-transform="uppercase">${businessName.split(" ").slice(2).join(" ") || CATEGORY_CONFIG[category]?.label || ""}</text>
        </svg>`,
      };

    case "text-only":
      return {
        style: "text-only",
        width: 300,
        height: 80,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 80" width="300" height="80">
          <text x="150" y="38" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="28" font-weight="800" fill="white" letter-spacing="-1">${businessName}</text>
          <line x1="100" y1="50" x2="200" y2="50" stroke="${color}" stroke-width="2"/>
          <text x="150" y="68" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="11" font-weight="600" fill="${color}" letter-spacing="4">${(CATEGORY_CONFIG[category]?.label || "").toUpperCase()}</text>
        </svg>`,
      };

    case "stacked":
    default:
      return {
        style: "stacked",
        width: 200,
        height: 200,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
          <g transform="translate(50,15) scale(1)" fill="none" stroke="${color}">${icon}</g>
          <text x="100" y="145" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="18" font-weight="800" fill="white" letter-spacing="-0.5">${businessName.length > 20 ? businessName.split(" ").slice(0, 2).join(" ") : businessName}</text>
          <text x="100" y="168" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="10" font-weight="600" fill="${color}" letter-spacing="3">${(CATEGORY_CONFIG[category]?.label || "").toUpperCase()}</text>
        </svg>`,
      };
  }
}

export function pickBestLogoStyle(businessName: string): LogoStyle {
  if (businessName.length <= 12) return "monogram";
  if (businessName.length <= 25) return "stacked";
  return "horizontal";
}

function darken(hex: string, amount: number): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
