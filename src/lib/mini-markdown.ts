/**
 * mini-markdown — tiny markdown → HTML renderer.
 *
 * Used by /blog/[slug] to render Claude-generated blog bodies. Not a
 * full CommonMark implementation — just enough for the constrained
 * vocabulary our seo-blog-writer emits: H1/H2/H3, bold, italic,
 * links, ordered + unordered lists, paragraphs, inline code.
 *
 * Trust model: the ONLY writer is our own cron (Claude output via
 * server-side code). No user-generated markdown lands here, so we
 * don't need a sanitization step.
 */

const ESC: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ESC[c]);
}

function inline(s: string): string {
  let out = escapeHtml(s);
  // [text](url) — link
  out = out.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-sky-400 hover:underline">$1</a>',
  );
  // **bold**
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // *italic* or _italic_
  out = out.replace(/(^|\W)\*([^*]+)\*(\W|$)/g, "$1<em>$2</em>$3");
  // `code`
  out = out.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-slate-800 text-sky-300 text-sm">$1</code>');
  return out;
}

export function renderMarkdown(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^\s*$/.test(line)) {
      i++;
      continue;
    }

    // Headings
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const sizes: Record<number, string> = {
        1: "text-3xl sm:text-4xl font-black tracking-tight mt-2 mb-4 text-white",
        2: "text-xl sm:text-2xl font-bold mt-8 mb-3 text-white",
        3: "text-lg font-semibold mt-6 mb-2 text-white",
      };
      const cls = sizes[level] ?? "font-semibold mt-4 mb-2 text-white";
      out.push(`<h${level} class="${cls}">${inline(h[2])}</h${level}>`);
      i++;
      continue;
    }

    // Unordered list — gather consecutive items
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      out.push(
        '<ul class="list-disc list-outside ml-6 my-4 space-y-1.5 text-slate-300">' +
          items.map((t) => `<li>${inline(t)}</li>`).join("") +
          "</ul>",
      );
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      out.push(
        '<ol class="list-decimal list-outside ml-6 my-4 space-y-1.5 text-slate-300">' +
          items.map((t) => `<li>${inline(t)}</li>`).join("") +
          "</ol>",
      );
      continue;
    }

    // Blockquote
    if (/^\s*>\s+/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\s*>\s+/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s+/, ""));
        i++;
      }
      out.push(
        `<blockquote class="border-l-4 border-sky-500/40 pl-4 my-4 italic text-slate-400">${inline(buf.join(" "))}</blockquote>`,
      );
      continue;
    }

    // Paragraph — gather until blank line
    const buf: string[] = [line];
    i++;
    while (i < lines.length && lines[i] && !/^(#|>|\s*[-*]\s+|\s*\d+\.\s+)/.test(lines[i])) {
      buf.push(lines[i]);
      i++;
    }
    out.push(`<p class="my-4 text-slate-200 leading-relaxed">${inline(buf.join(" "))}</p>`);
  }

  return out.join("\n");
}
