/**
 * AIOSMark — text-wordmark v3 (locked 2026-05-18).
 *
 * v1 = abstract shield with hammer + carpenter's square (Ben: "too busy")
 * v2 = gable roof + bubble level + foundation rule (Ben: "too icon-y")
 * v3 = pure type. Ben's brief: "text redesign — beautiful and bespoke.
 *      That's what home buyers want to see."
 *
 * Stacked AIO monogram set in Space Grotesk Bold with a copper
 * gradient baseline rule beneath. Reads cleanly at every size
 * (12px favicon → 36px nav → 56px footer) and pairs naturally with
 * the "ALL IN ONE SERVICES" wordmark already rendered next to it in
 * the sticky-nav + footer lockup. No icon clutter.
 *
 * Premium remodel benchmarks for this typographic direction:
 * Restoration Hardware, Snøhetta, McAlpine, Pursley Dixon. The
 * mark IS the letterforms — quiet confidence beats a busy badge.
 */

type Props = {
  size?: number;
  className?: string;
  /** When true, drops the glow shadow (use inside small spaces). */
  flat?: boolean;
};

export default function AIOSMark({ size = 32, className = "", flat = false }: Props) {
  // Tuning: the letters take ~50% of the box height; the copper
  // baseline rule sits beneath with a small gap. Looks square-ish at
  // every common size we render this at.
  const letterSize = size * 0.52;
  const ruleWidth = size * 0.66;
  const ruleHeight = Math.max(1.5, size * 0.045);
  const ruleGap = size * 0.06;

  return (
    <span
      className={`inline-flex flex-col items-center justify-center align-middle ${className}`}
      style={{
        width: size,
        height: size,
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        lineHeight: 1,
        letterSpacing: "-0.04em",
        ...(flat
          ? {}
          : { filter: "drop-shadow(0 1px 4px rgba(217, 119, 6, 0.28))" }),
      }}
      aria-hidden="true"
    >
      <span
        style={{
          fontSize: letterSize,
          color: "#1a1612",
          // Slight rendering hint — tabular numerals + smooth anti-alias
          fontFeatureSettings: "'ss01' on, 'ss02' on",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}
      >
        AIO
      </span>
      <span
        style={{
          display: "block",
          width: ruleWidth,
          height: ruleHeight,
          marginTop: ruleGap,
          borderRadius: ruleHeight,
          background:
            "linear-gradient(90deg, #fcd34d 0%, #d97706 50%, #92400e 100%)",
        }}
      />
    </span>
  );
}
