"use client";

/**
 * Tiny client island for the print button on the Training Guide page.
 * Server components can't bind onClick handlers, so we extract just
 * this button.
 */
export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      type="button"
      className="bg-[#a3e635] text-[#0a1832] text-xs font-extrabold tracking-wider uppercase px-4 py-2 rounded hover:bg-white"
    >
      Save as PDF / Print
    </button>
  );
}
