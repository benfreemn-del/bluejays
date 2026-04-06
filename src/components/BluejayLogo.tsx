interface BluejayLogoProps {
  className?: string;
  size?: number;
}

export default function BluejayLogo({ className = "", size = 24 }: BluejayLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="currentColor"
      className={className}
    >
      {/* Blue Jay — side profile perched, with distinct crest, beak, wing bar, long tail */}
      {/* Head + crest */}
      <path d="M52 18 C56 12, 62 8, 60 4 C58 2, 54 6, 52 10 C50 6, 46 2, 44 4 C42 8, 48 12, 52 18Z" />
      {/* Head circle */}
      <ellipse cx="50" cy="24" rx="12" ry="11" />
      {/* Eye (negative space) */}
      <ellipse cx="54" cy="22" rx="2.5" ry="2.5" fill="#0a0a0a" />
      <ellipse cx="54.5" cy="21.5" rx="1" ry="1" fill="white" />
      {/* Beak */}
      <path d="M62 25 L74 23 L62 27Z" />
      {/* Black necklace band */}
      <path d="M40 32 Q50 38, 60 32 Q58 36, 50 38 Q42 36, 40 32Z" opacity="0.3" />
      {/* Body */}
      <ellipse cx="46" cy="50" rx="18" ry="20" />
      {/* Wing with bar markings */}
      <path d="M34 40 C28 48, 26 58, 30 68 L36 66 C32 58, 32 48, 36 42Z" opacity="0.7" />
      <path d="M32 52 L28 54" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <path d="M31 56 L27 58" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <path d="M30 60 L26 62" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      {/* Tail feathers — long, distinctive */}
      <path d="M36 66 C28 72, 20 80, 12 90 L18 90 C24 82, 30 74, 38 68Z" />
      <path d="M38 68 C32 74, 26 82, 20 92 L26 92 C30 84, 34 76, 40 70Z" opacity="0.8" />
      {/* Legs */}
      <path d="M44 68 L42 78 L38 80 M42 78 L44 80 M42 78 L46 80" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.6" />
      <path d="M50 68 L52 78 L48 80 M52 78 L54 80 M52 78 L56 80" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.6" />
      {/* Belly highlight */}
      <ellipse cx="48" cy="55" rx="8" ry="10" opacity="0.15" />
    </svg>
  );
}

export function BluejayLogoCircle({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <div
      className={`rounded-full bg-gradient-to-br from-blue-electric to-blue-deep shadow-[0_0_20px_rgba(14,165,233,0.3)] flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <BluejayLogo size={size * 0.6} className="text-white" />
    </div>
  );
}
