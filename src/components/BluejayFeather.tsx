/**
 * BluejayFeather — a small blue jay feather icon for footer credits.
 *
 * Distinct from <BluejayLogo /> which renders the full perched bird.
 * This is the slim, single-feather mark used as a unicode-icon-sized
 * embellishment next to "Built by BlueJays" in client-site footers.
 *
 * Defaults to 14px so it sits inline with body-text "Built by"
 * without inflating line-height. Color is solid blue (#0ea5e9 sky)
 * with subtle white inner-vane highlights so it reads on light + dark
 * footers without changing color.
 */

export default function BluejayFeather({
  size = 14,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="bj-feather-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="55%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </linearGradient>
      </defs>
      {/* Feather silhouette — angled, with curved tip + soft taper to
          quill end. Path drawn so the feather "points" up-right, like
          a bird shedding it on the wing. */}
      <path
        d="M3 21 C 6 17, 11 12, 16 6 C 19 3, 22 2, 22 5 C 22 9, 17 14, 11 18 C 8 20, 5 21.5, 3 21 Z"
        fill="url(#bj-feather-grad)"
      />
      {/* Inner vane lines — three thin highlights radiating from the
          rachis to suggest barbs without drawing every one. */}
      <path
        d="M5 19 C 8 16, 13 11, 18 7"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="0.6"
        fill="none"
      />
      <path
        d="M7 20 C 10 18, 14 14, 19 10"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="0.5"
        fill="none"
      />
      <path
        d="M5 18 C 8 15, 13 10, 17 6"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="0.5"
        fill="none"
      />
      {/* Tiny quill tip — darker dot at the bottom-left so the feather
          reads as having a "pen end" rather than just being a leaf. */}
      <circle cx="3.5" cy="20.5" r="0.7" fill="#0c4a6e" />
    </svg>
  );
}
