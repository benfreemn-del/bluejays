"use client";

export default function PrintPdfButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-md border border-white/10 hover:border-white/30 bg-white/[0.03] transition-colors"
      aria-label="Save or print this audit as a PDF"
    >
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-3.5 h-3.5"
        aria-hidden
      >
        <path d="M6 2a2 2 0 0 0-2 2v3h12V4a2 2 0 0 0-2-2H6Z" />
        <path d="M4 9a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H4Zm3 4h6v4H7v-4Z" />
      </svg>
      Save as PDF
    </button>
  );
}
