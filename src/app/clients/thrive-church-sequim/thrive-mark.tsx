/**
 * ThriveMark — bespoke logo mark for Thrive Church Sequim.
 *
 * Visual: a stylized sunrise arcing over a horizon line with three
 * radiating rays — symbolic of the church's tagline ("hope and healing
 * to the world"). Deep teal mark + warm amber sun.
 *
 * Fills its parent container by default (preserves aspect ratio via
 * viewBox). The hosting element controls size — e.g. `h-12 w-12`,
 * `h-[420px] w-[420px]`. Pass `size` to render at an explicit pixel
 * size instead. Pairs next to the "THRIVE" wordmark in the sticky-nav
 * lockup.
 */

type Props = {
  size?: number;
  className?: string;
  /** When true, drops the drop-shadow (for small spaces / mobile nav). */
  flat?: boolean;
};

const TEAL = "#0d4f4a";
const TEAL_DEEP = "#0a3a36";
const AMBER = "#d97706";
const AMBER_LIGHT = "#fbbf24";

export default function ThriveMark({ size, className = "", flat = false }: Props) {
  // When `size` is provided, render at that fixed pixel size.
  // When omitted, fill the parent element (width/height 100% — the
  // viewBox preserves aspect ratio).
  const sizingProps =
    typeof size === "number"
      ? { width: size, height: size }
      : { width: "100%", height: "100%" };

  return (
    <svg
      {...sizingProps}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={
        flat
          ? undefined
          : { filter: "drop-shadow(0 1px 4px rgba(13, 79, 74, 0.22))" }
      }
      aria-hidden="true"
    >
      {/* Horizon line — deep teal grounded base */}
      <rect x="6" y="34" width="36" height="2.4" rx="1.2" fill={TEAL_DEEP} />

      {/* Sun arc — warm amber half-disc rising over the horizon */}
      <defs>
        <linearGradient id="thriveSun" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={AMBER_LIGHT} />
          <stop offset="100%" stopColor={AMBER} />
        </linearGradient>
      </defs>

      {/* Sun half-disc */}
      <path
        d="M14 34 A10 10 0 0 1 34 34 Z"
        fill="url(#thriveSun)"
      />

      {/* Center ray (vertical) */}
      <rect x="22.8" y="6" width="2.4" height="9" rx="1.2" fill={TEAL} />

      {/* Left ray */}
      <rect
        x="11.5"
        y="11.5"
        width="2.4"
        height="9"
        rx="1.2"
        fill={TEAL}
        transform="rotate(-45 12.7 16)"
      />

      {/* Right ray */}
      <rect
        x="34.1"
        y="11.5"
        width="2.4"
        height="9"
        rx="1.2"
        fill={TEAL}
        transform="rotate(45 35.3 16)"
      />
    </svg>
  );
}
