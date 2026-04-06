import type { Category } from "@/lib/types";

interface SectionBackgroundProps {
  category: Category;
  variant?: "hero" | "services" | "about" | "testimonials" | "contact";
  className?: string;
}

export default function SectionBackground({ category, variant = "services", className = "" }: SectionBackgroundProps) {
  const patterns = getPatterns(category);
  const pattern = patterns[variant] || patterns.services;

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Soft glow */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-[150px] opacity-[0.07]"
        style={{
          background: pattern.glowColor,
          top: pattern.glowY,
          left: pattern.glowX,
        }}
      />
      {/* SVG pattern elements */}
      {pattern.elements.map((el, i) => (
        <svg
          key={i}
          className="absolute"
          style={{
            width: el.size,
            height: el.size,
            top: el.y,
            left: el.x,
            opacity: el.opacity,
            transform: `rotate(${el.rotate}deg)`,
          }}
          viewBox="0 0 100 100"
          fill="none"
          stroke={pattern.strokeColor}
          strokeWidth="1"
        >
          <path d={el.path} />
        </svg>
      ))}
    </div>
  );
}

interface PatternElement {
  path: string;
  size: number;
  x: string;
  y: string;
  opacity: number;
  rotate: number;
}

interface PatternConfig {
  glowColor: string;
  glowX: string;
  glowY: string;
  strokeColor: string;
  elements: PatternElement[];
}

function getPatterns(category: Category): Record<string, PatternConfig> {
  const configs: Partial<Record<Category, Record<string, PatternConfig>>> = {
    dental: {
      services: {
        glowColor: "#10b981", glowX: "60%", glowY: "20%", strokeColor: "rgba(16,185,129,0.08)",
        elements: [
          { path: "M50 10 C40 10 30 20 30 35 L30 60 C30 75 40 85 50 90 C60 85 70 75 70 60 L70 35 C70 20 60 10 50 10Z", size: 120, x: "5%", y: "10%", opacity: 0.06, rotate: -15 },
          { path: "M50 10 C40 10 30 20 30 35 L30 60 C30 75 40 85 50 90 C60 85 70 75 70 60 L70 35 C70 20 60 10 50 10Z", size: 80, x: "80%", y: "60%", opacity: 0.04, rotate: 20 },
          { path: "M30 50 Q50 30 70 50 Q50 70 30 50Z", size: 60, x: "70%", y: "15%", opacity: 0.05, rotate: 0 },
        ],
      },
      about: {
        glowColor: "#10b981", glowX: "30%", glowY: "50%", strokeColor: "rgba(16,185,129,0.06)",
        elements: [
          { path: "M50 10 C40 10 30 20 30 35 L30 60 C30 75 40 85 50 90 C60 85 70 75 70 60 L70 35 C70 20 60 10 50 10Z", size: 150, x: "85%", y: "5%", opacity: 0.04, rotate: 10 },
        ],
      },
      testimonials: {
        glowColor: "#10b981", glowX: "40%", glowY: "30%", strokeColor: "rgba(16,185,129,0.05)",
        elements: [
          { path: "M50 10 C40 10 30 20 30 35 L30 60 C30 75 40 85 50 90 C60 85 70 75 70 60 L70 35 C70 20 60 10 50 10Z", size: 100, x: "90%", y: "70%", opacity: 0.04, rotate: -20 },
        ],
      },
    },
    "law-firm": {
      services: {
        glowColor: "#8b5cf6", glowX: "70%", glowY: "30%", strokeColor: "rgba(139,92,246,0.08)",
        elements: [
          // Scales of justice
          { path: "M50 10 L50 70 M30 70 L70 70 M25 30 L75 30 M25 30 L15 50 L35 50Z M75 30 L65 50 L85 50Z", size: 130, x: "3%", y: "15%", opacity: 0.06, rotate: 0 },
          { path: "M20 90 L80 90 L50 10Z", size: 80, x: "75%", y: "55%", opacity: 0.04, rotate: 0 },
        ],
      },
      about: {
        glowColor: "#8b5cf6", glowX: "20%", glowY: "40%", strokeColor: "rgba(139,92,246,0.06)",
        elements: [
          { path: "M50 10 L50 70 M30 70 L70 70 M25 30 L75 30", size: 120, x: "80%", y: "10%", opacity: 0.04, rotate: 5 },
        ],
      },
      testimonials: {
        glowColor: "#8b5cf6", glowX: "50%", glowY: "20%", strokeColor: "rgba(139,92,246,0.05)",
        elements: [
          { path: "M20 90 L80 90 L50 10Z", size: 90, x: "5%", y: "60%", opacity: 0.04, rotate: -10 },
        ],
      },
    },
    landscaping: {
      services: {
        glowColor: "#22c55e", glowX: "50%", glowY: "20%", strokeColor: "rgba(34,197,94,0.08)",
        elements: [
          // Leaf shapes
          { path: "M50 10 C30 30 20 60 50 90 C80 60 70 30 50 10Z M50 10 L50 90", size: 120, x: "5%", y: "10%", opacity: 0.06, rotate: -20 },
          { path: "M50 10 C30 30 20 60 50 90 C80 60 70 30 50 10Z M50 10 L50 90", size: 90, x: "85%", y: "50%", opacity: 0.04, rotate: 30 },
          { path: "M50 10 C30 30 20 60 50 90 C80 60 70 30 50 10Z", size: 60, x: "70%", y: "10%", opacity: 0.05, rotate: -45 },
        ],
      },
      about: {
        glowColor: "#22c55e", glowX: "30%", glowY: "50%", strokeColor: "rgba(34,197,94,0.06)",
        elements: [
          { path: "M50 10 C30 30 20 60 50 90 C80 60 70 30 50 10Z M50 10 L50 90", size: 160, x: "80%", y: "0%", opacity: 0.04, rotate: 15 },
        ],
      },
      testimonials: {
        glowColor: "#22c55e", glowX: "60%", glowY: "40%", strokeColor: "rgba(34,197,94,0.05)",
        elements: [
          { path: "M30 80 C30 40 50 20 50 20 C50 20 70 40 70 80", size: 100, x: "90%", y: "60%", opacity: 0.04, rotate: 0 },
        ],
      },
    },
    salon: {
      services: {
        glowColor: "#ec4899", glowX: "40%", glowY: "25%", strokeColor: "rgba(236,72,153,0.08)",
        elements: [
          // Scissors
          { path: "M35 20 C20 20 20 40 35 40 C40 40 40 35 35 30 L65 70 M65 20 C80 20 80 40 65 40 C60 40 60 35 65 30 L35 70", size: 110, x: "5%", y: "15%", opacity: 0.06, rotate: 10 },
          { path: "M50 20 Q30 50 50 80 Q70 50 50 20Z", size: 80, x: "80%", y: "55%", opacity: 0.04, rotate: -15 },
        ],
      },
      about: {
        glowColor: "#ec4899", glowX: "70%", glowY: "30%", strokeColor: "rgba(236,72,153,0.06)",
        elements: [
          { path: "M35 20 C20 20 20 40 35 40 L65 70 M65 20 C80 20 80 40 65 40 L35 70", size: 130, x: "85%", y: "5%", opacity: 0.04, rotate: -20 },
        ],
      },
      testimonials: {
        glowColor: "#ec4899", glowX: "30%", glowY: "50%", strokeColor: "rgba(236,72,153,0.05)",
        elements: [
          { path: "M50 20 Q30 50 50 80 Q70 50 50 20Z", size: 70, x: "5%", y: "65%", opacity: 0.04, rotate: 20 },
        ],
      },
    },
    "real-estate": {
      services: {
        glowColor: "#c8a45e", glowX: "60%", glowY: "20%", strokeColor: "rgba(200,164,94,0.08)",
        elements: [
          // House shapes
          { path: "M50 15 L15 45 L15 85 L85 85 L85 45Z M40 85 L40 60 L60 60 L60 85", size: 120, x: "3%", y: "10%", opacity: 0.06, rotate: 0 },
          { path: "M50 20 L20 45 L20 80 L80 80 L80 45Z", size: 80, x: "80%", y: "55%", opacity: 0.04, rotate: 5 },
          { path: "M30 30 L50 15 L70 30 L70 50 L30 50Z", size: 60, x: "65%", y: "10%", opacity: 0.05, rotate: -10 },
        ],
      },
      about: {
        glowColor: "#c8a45e", glowX: "25%", glowY: "40%", strokeColor: "rgba(200,164,94,0.06)",
        elements: [
          { path: "M50 15 L15 45 L15 85 L85 85 L85 45Z M40 85 L40 60 L60 60 L60 85", size: 150, x: "82%", y: "5%", opacity: 0.04, rotate: 0 },
        ],
      },
      testimonials: {
        glowColor: "#c8a45e", glowX: "50%", glowY: "30%", strokeColor: "rgba(200,164,94,0.05)",
        elements: [
          { path: "M30 30 L50 15 L70 30 L70 50 L30 50Z", size: 90, x: "90%", y: "65%", opacity: 0.04, rotate: -5 },
        ],
      },
    },
  };

  // Default fallback
  const defaultPattern: PatternConfig = {
    glowColor: "#0ea5e9", glowX: "50%", glowY: "30%", strokeColor: "rgba(14,165,233,0.06)",
    elements: [
      { path: "M50 10 C30 30 20 60 50 90 C80 60 70 30 50 10Z", size: 100, x: "85%", y: "15%", opacity: 0.04, rotate: 0 },
    ],
  };

  const categoryConfig = configs[category];
  if (!categoryConfig) {
    return { services: defaultPattern, about: defaultPattern, testimonials: defaultPattern, hero: defaultPattern, contact: defaultPattern };
  }

  return {
    services: categoryConfig.services || defaultPattern,
    about: categoryConfig.about || defaultPattern,
    testimonials: categoryConfig.testimonials || defaultPattern,
    hero: defaultPattern,
    contact: defaultPattern,
  };
}
