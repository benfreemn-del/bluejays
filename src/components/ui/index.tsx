/**
 * src/components/ui — BlueJays shared design primitives.
 *
 * Use these on every new operator dashboard / wizard / admin page so
 * the visual language stays consistent and one PR can rebrand the
 * whole backend. The pattern + tokens are documented in
 * docs/DESIGN_SYSTEM.md — read that first if you're about to invent
 * a new variant.
 *
 * Quick reference:
 *   <Page>                — full-bleed slate-950, max-width container
 *   <PageHeader …>        — title + eyebrow + description
 *   <Card>                — primary surface (rounded-2xl, slate-900/60)
 *   <CardSubtle>          — secondary surface, less prominent
 *   <Pill tone="…">       — status pill (emerald/amber/rose/sky/slate/violet)
 *   <StatusDot tone="…">  — 2.5px colored dot for inline status
 *   <Button variant="…">  — primary/success/secondary/ghost
 *   <EmptyState …>        — zero-data state
 *   <SectionLabel>        — small uppercase section header
 *   <Label>               — form-field label (used inside <Field>)
 *   <Field label>{input}  — wrapped input with label
 *   <Input> / <Textarea>  — pre-styled inputs
 *   <Stack gap>           — vertical layout helper
 */

import type { ReactNode, HTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, ButtonHTMLAttributes } from "react";

/* ───────────────────────── PAGE ───────────────────────── */

export function Page({ children, max = "4xl" }: { children: ReactNode; max?: "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" }) {
  const widths: Record<string, string> = {
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
  };
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className={`mx-auto ${widths[max]} px-6 py-10`}>{children}</div>
    </main>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-8 flex items-end justify-between flex-wrap gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs uppercase tracking-wider text-sky-400 font-semibold mb-2">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        {description && (
          <p className="text-sm text-slate-400 max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </header>
  );
}

/* ───────────────────────── SURFACES ───────────────────────── */

export function Card({
  children,
  className = "",
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      {...rest}
      className={`rounded-2xl border border-white/10 bg-slate-900/60 p-5 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardSubtle({
  children,
  className = "",
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      {...rest}
      className={`rounded-xl border border-white/5 bg-slate-900/30 p-4 ${className}`}
    >
      {children}
    </div>
  );
}

/* ───────────────────────── PILLS + STATUS ───────────────────────── */

export type Tone = "emerald" | "amber" | "rose" | "sky" | "slate" | "violet";

const PILL_TONES: Record<Tone, string> = {
  emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  amber: "bg-amber-500/15 text-amber-300 border-amber-500/40",
  rose: "bg-rose-500/15 text-rose-300 border-rose-500/40",
  sky: "bg-sky-500/15 text-sky-300 border-sky-500/40",
  slate: "bg-slate-800 text-slate-400 border-slate-700",
  violet: "bg-violet-500/15 text-violet-300 border-violet-500/40",
};

export function Pill({ tone = "slate", children, className = "" }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider rounded-full border px-2 py-0.5 ${PILL_TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

const DOT_TONES: Record<Tone, string> = {
  emerald: "bg-emerald-400",
  amber: "bg-amber-400",
  rose: "bg-rose-400",
  sky: "bg-sky-400",
  slate: "bg-slate-500",
  violet: "bg-violet-400",
};

export function StatusDot({ tone = "slate", className = "" }: { tone?: Tone; className?: string }) {
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${DOT_TONES[tone]} ${className}`} />;
}

/* ───────────────────────── BUTTONS ───────────────────────── */

type ButtonVariant = "primary" | "success" | "secondary" | "ghost" | "danger";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-slate-950 font-semibold",
  success:
    "bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-slate-950 font-semibold",
  secondary:
    "border border-white/10 hover:bg-slate-900 disabled:opacity-50 text-slate-200",
  ghost:
    "text-slate-400 hover:text-white disabled:opacity-50",
  danger:
    "border border-rose-500/40 text-rose-300 hover:bg-rose-500/10 disabled:opacity-50",
};

const BUTTON_SIZES: Record<"sm" | "md" | "lg", string> = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}) {
  return (
    <button
      {...rest}
      className={`rounded-lg transition-colors ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`}
    >
      {children}
    </button>
  );
}

/* ───────────────────────── EMPTY STATE ───────────────────────── */

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-10 text-center">
      {icon && <div className="text-5xl mb-3">{icon}</div>}
      <p className="text-sm font-semibold text-white">{title}</p>
      {description && (
        <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">{description}</p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

/* ───────────────────────── SECTIONS + LABELS ───────────────────────── */

export function SectionLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`text-xs uppercase tracking-wider text-slate-400 font-semibold ${className}`}
    >
      {children}
    </p>
  );
}

export function Label({ children, required, className = "" }: { children: ReactNode; required?: boolean; className?: string }) {
  return (
    <span
      className={`block text-xs uppercase tracking-wider text-slate-400 mb-1 ${className}`}
    >
      {children}
      {required && <span className="text-rose-400 ml-1">*</span>}
    </span>
  );
}

/* ───────────────────────── FORM PRIMITIVES ───────────────────────── */

export function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <Label required={required}>{label}</Label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
    </label>
  );
}

const INPUT_BASE =
  "w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm placeholder-slate-600 focus:outline-none focus:border-sky-500/50";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input {...rest} className={`${INPUT_BASE} ${className}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", rows = 3, ...rest } = props;
  return <textarea {...rest} rows={rows} className={`${INPUT_BASE} ${className}`} />;
}

export function Select({
  className = "",
  children,
  ...rest
}: InputHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select {...rest} className={`${INPUT_BASE} ${className}`}>
      {children}
    </select>
  );
}

/* ───────────────────────── LAYOUT HELPERS ───────────────────────── */

export function Stack({
  gap = 4,
  className = "",
  children,
}: {
  gap?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10;
  className?: string;
  children: ReactNode;
}) {
  const gaps: Record<number, string> = {
    1: "space-y-1",
    2: "space-y-2",
    3: "space-y-3",
    4: "space-y-4",
    5: "space-y-5",
    6: "space-y-6",
    8: "space-y-8",
    10: "space-y-10",
  };
  return <div className={`${gaps[gap]} ${className}`}>{children}</div>;
}

/* ───────────────────────── ERROR HINT ───────────────────────── */

export function ErrorHint({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm text-rose-400 whitespace-pre-wrap">{children}</p>
  );
}
