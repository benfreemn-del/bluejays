"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

/**
 * Shared leads-search bar.
 *
 * Renders a single-line input that:
 *   - reads/writes `?q=` from the URL (sharable, back-button works)
 *   - debounces ~150ms before pushing to URL (no thrashing)
 *   - exposes value to the parent via `onChange(q)` (parent owns the
 *     filtering — search composes AND with existing filters)
 *   - Cmd/Ctrl+K to focus from anywhere on the page
 *   - "/" key (when not focused on another input) also focuses
 *   - Clear button (✕) when there's text — also clears the URL param
 *   - Esc clears search
 *
 * Used by:
 *   - BlueJays main /dashboard prospects table
 *   - Each AI System client portal Leads tab
 *   - Bake into AI System template so new clients get it free
 *
 * Mobile: full-width, always visible (matches Hormozi-style speed —
 * search must never require an extra tap).
 */

interface LeadsSearchBarProps {
  /** Initial query — defaults to URL ?q= if undefined */
  initialQuery?: string;
  /** Called every time the debounced query changes (incl. on clear) */
  onChange: (query: string) => void;
  /** Placeholder text. Default: "Search leads…" */
  placeholder?: string;
  /** Total count from the parent's filtered array — drives the empty-state hint */
  totalCount?: number;
  /** True when the parent's filter pipeline returned 0 rows */
  showNoResults?: boolean;
  /** When user clicks "Clear search" in the no-results banner */
  onClear?: () => void;
  /** Optional extra className for layout integration */
  className?: string;
  /** Whether to write `?q=` to the URL (default true). Disable for pages that already use ?q for something else. */
  syncToUrl?: boolean;
}

const DEBOUNCE_MS = 150;

export default function LeadsSearchBar({
  initialQuery,
  onChange,
  placeholder = "Search leads…",
  totalCount,
  showNoResults,
  onClear,
  className,
  syncToUrl = true,
}: LeadsSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);

  // The local input state. We render this directly so typing feels instant.
  // The debounced effect below pushes to URL + calls onChange after 150ms.
  const [value, setValue] = useState<string>(() => {
    if (initialQuery !== undefined) return initialQuery;
    return searchParams.get("q") || "";
  });

  // Debounce: 150ms after last keystroke, sync to URL + onChange
  useEffect(() => {
    const t = setTimeout(() => {
      onChange(value.trim());
      if (syncToUrl) {
        const params = new URLSearchParams(Array.from(searchParams.entries()));
        if (value.trim()) {
          params.set("q", value.trim());
        } else {
          params.delete("q");
        }
        const qs = params.toString();
        const url = qs ? `${pathname}?${qs}` : pathname;
        // replace (not push) so search keystrokes don't pollute history
        router.replace(url, { scroll: false });
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Cmd/Ctrl+K and "/" to focus the search bar from anywhere
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        return;
      }
      // "/" — only when NOT typing in another input/textarea
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleClear = useCallback(() => {
    setValue("");
    inputRef.current?.focus();
    onClear?.();
  }, [onClear]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape" && value) {
        e.preventDefault();
        setValue("");
      }
    },
    [value],
  );

  return (
    <div className={className}>
      <div className="relative w-full">
        {/* Search icon */}
        <svg
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="search"
          inputMode="search"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search leads"
          className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-20 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            Clear ✕
          </button>
        )}
        {!value && (
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:block text-[10px] font-medium text-slate-400 dark:text-slate-500"
            aria-hidden="true"
          >
            ⌘K
          </span>
        )}
      </div>

      {/* No-results banner — parent passes showNoResults when totalCount === 0 after search */}
      {showNoResults && value && (
        <div className="mt-2 flex items-center justify-between rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          <span>
            No matches for <span className="font-semibold">&ldquo;{value}&rdquo;</span>
            {typeof totalCount === "number" && totalCount > 0
              ? ` (searched across ${totalCount.toLocaleString()} lead${totalCount === 1 ? "" : "s"}).`
              : "."}
          </span>
          <button
            type="button"
            onClick={handleClear}
            className="ml-3 rounded-md border border-amber-400/50 px-2 py-0.5 text-[11px] font-semibold hover:bg-amber-100 dark:border-amber-400/40 dark:hover:bg-amber-500/15"
          >
            Clear search ✕
          </button>
        </div>
      )}
    </div>
  );
}
