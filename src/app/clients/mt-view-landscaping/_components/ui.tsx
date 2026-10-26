/* eslint-disable @next/next/no-img-element */
import { PHOTO_PATH } from "../_lib/site";
import { photo as getPhoto } from "../_lib/photos";

/* Colors inlined as literal Tailwind values (JIT can't read interpolation).
 * paper #F5F1E8 · bone #FBF8F1 · sage #E7EADF · mint #EDF3EC · ink #20241C ·
 * body #3E4435 · green #2F7D4F · greenDeep #234E36 · star #E0A100 */
export const head = "font-[family-name:var(--font-playfair)]";
export const body = "font-[family-name:var(--font-inter)]";

/**
 * Responsive photo. Every photo ships as -640 and -1600 webp; the "big"
 * ones (heroes, banners) also have -2400. width/height are set from the
 * real aspect so nothing jumps while loading.
 */
export function Photo({
  id,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  className = "",
  priority = false,
  alt,
}: {
  id: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
  alt?: string;
}) {
  const p = getPhoto(id);
  const src = (w: number) => `${PHOTO_PATH}/${p.id}-${w}.webp`;
  const srcSet = [`${src(640)} 640w`, `${src(1600)} 1600w`, ...(p.big ? [`${src(2400)} 2400w`] : [])].join(", ");
  return (
    <img
      src={src(1600)}
      srcSet={srcSet}
      sizes={sizes}
      width={p.w}
      height={p.h}
      alt={alt ?? p.alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
    />
  );
}

export function GreenBtn({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={href} className={`inline-flex items-center justify-center gap-2 bg-[#2F7D4F] hover:bg-[#234E36] text-white px-7 py-3.5 ${body} text-[16px] font-semibold rounded-full transition-colors ${className}`}>
      {children}
    </a>
  );
}

export function GhostBtn({ href, children, light = false }: { href: string; children: React.ReactNode; light?: boolean }) {
  const tone = light
    ? "border-white/60 hover:border-white text-white"
    : "border-[#2F7D4F]/40 hover:border-[#2F7D4F] text-[#234E36]";
  return (
    <a href={href} className={`inline-flex items-center justify-center gap-2 border-2 ${tone} px-7 py-3.5 ${body} text-[16px] font-semibold rounded-full transition-colors`}>
      {children}
    </a>
  );
}

export function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className={`${body} text-[13px] tracking-[0.16em] uppercase font-bold ${light ? "text-[#BFE3C6]" : "text-[#2F7D4F]"}`}>
      {children}
    </p>
  );
}

export function H2({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`${head} font-semibold text-[32px] sm:text-[42px] leading-[1.08] text-[#20241C] ${className}`}>{children}</h2>;
}

/** Inject a JSON-LD block. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
