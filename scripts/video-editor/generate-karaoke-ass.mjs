#!/usr/bin/env node
// Read Whisper word-timestamps → emit karaoke-style ASS captions
// tuned for vertical 1080×1920 phone video at top-frame placement.
//
// Card grouping:
//   - max 5 words per card
//   - max 1.8s per card
//   - force-break when gap between words > 0.35s (natural phrase boundary)
//
// Brand styling:
//   - Arial Black 72pt bold white, 5px outline, 3px drop shadow
//   - Top-center alignment, MarginV 220 (sky zone above head)
//   - Sky-blue (#38bdf8 → BGR &HF8BD38&) on emphasis words

import fs from "node:fs";

const TRANSCRIPT_PATH = "edit-cache/vsl-1-transcript.json";
const OUT_PATH = "edit-cache/vsl-1-captions.ass";

const MAX_WORDS_PER_CARD = 5;
const MAX_DURATION_PER_CARD = 1.8;
const FORCE_BREAK_GAP = 0.35;
const TAIL_BUFFER = 0.08;

// Connector / function words that look weak at the END of a card.
// Hormozi-style captions end on content words, not "the" / "of" / "to" /
// "and" — so when we break mid-phrase (due to max-words/duration), pull
// the last connector forward into the next card.
const CONNECTOR_WORDS = new Set([
  "a", "an", "the", "of", "to", "for", "in", "on", "at", "by", "from",
  "with", "into", "onto", "as", "and", "or", "but", "so", "nor", "yet",
  "is", "are", "was", "were", "be", "been", "being", "am",
  "i", "we", "you", "he", "she", "it", "they",
]);

// Emphasis phrases — first occurrence of each phrase gets sky-blue.
// Multi-word phrases (like "47 things") emphasize both words in sequence.
const EMPHASIS_PHRASES = [
  ["47", "things"],
  ["nine"],
  ["thousands"],
  ["scroll"],
];

const transcript = JSON.parse(fs.readFileSync(TRANSCRIPT_PATH, "utf8"));
const words = transcript.words;
const text = transcript.text || "";
if (!words || !words.length) {
  console.error("No words array in transcript JSON");
  process.exit(1);
}

// Walk each word's position in the text field so we can detect when a word
// is followed by punctuation (comma, period, em-dash). Those positions are
// natural phrase boundaries — they get a forced card break so cards never
// end on "to" / "your" / "and" mid-sentence.
const endsPhrase = new Array(words.length).fill(false);
{
  let cursor = 0;
  for (let i = 0; i < words.length; i++) {
    const wordText = words[i].word.trim();
    if (!wordText) continue;
    const idx = text.indexOf(wordText, cursor);
    if (idx === -1) continue;
    cursor = idx + wordText.length;
    // Look at next non-space char
    let p = cursor;
    while (p < text.length && text[p] === " ") p++;
    if (p >= text.length || /[.,!?—–\-]/.test(text[p])) {
      endsPhrase[i] = true;
    }
  }
}

// Normalize a word for emphasis matching: lowercase + strip punctuation
const norm = (w) => w.word.toLowerCase().replace(/[^a-z0-9]/gi, "");

// Find first-occurrence indices for each emphasis phrase
const emphasizedIdx = new Set();
for (const phrase of EMPHASIS_PHRASES) {
  outer: for (let i = 0; i <= words.length - phrase.length; i++) {
    for (let j = 0; j < phrase.length; j++) {
      if (norm(words[i + j]) !== phrase[j].toLowerCase()) continue outer;
    }
    for (let j = 0; j < phrase.length; j++) emphasizedIdx.add(i + j);
    break;
  }
}

console.log(`emphasized word indices: ${[...emphasizedIdx].sort((a, b) => a - b).join(", ")}`);

// Group words into cards
const cards = [];
let currentCard = [];
let currentStart = null;

const flushCard = () => {
  if (currentCard.length === 0) return;
  const firstIdx = currentCard[0];
  const lastIdx = currentCard[currentCard.length - 1];
  cards.push({
    start: words[firstIdx].start,
    end: words[lastIdx].end + TAIL_BUFFER,
    indices: [...currentCard],
  });
  currentCard = [];
  currentStart = null;
};

for (let i = 0; i < words.length; i++) {
  const w = words[i];
  if (currentCard.length === 0) {
    currentCard.push(i);
    currentStart = w.start;
  } else {
    const prevWord = words[currentCard[currentCard.length - 1]];
    const gap = w.start - prevWord.end;
    const durationIfAdded = w.end - currentStart;
    if (
      gap > FORCE_BREAK_GAP ||
      currentCard.length >= MAX_WORDS_PER_CARD ||
      durationIfAdded > MAX_DURATION_PER_CARD
    ) {
      // Before flushing: pop any trailing connectors ("the" / "to" / "and")
      // so the card we flush ends on a content word. The popped ones
      // become the first words of the next card.
      const popped = [];
      while (
        currentCard.length > 1 &&
        CONNECTOR_WORDS.has(norm(words[currentCard[currentCard.length - 1]]))
      ) {
        popped.unshift(currentCard.pop());
      }
      flushCard();
      // Restore popped connectors as the start of the new card
      for (const p of popped) currentCard.push(p);
      if (currentCard.length > 0) currentStart = words[currentCard[0]].start;
      // Now add the current word
      if (currentCard.length === 0) currentStart = w.start;
      currentCard.push(i);
    } else {
      currentCard.push(i);
    }
  }
  // After adding this word, check if it ends a phrase (next char is punctuation)
  // If so, force flush so the next card starts cleanly on a new phrase.
  if (endsPhrase[i] && currentCard.length > 0) {
    flushCard();
  }
}
flushCard();

// Eliminate inter-card gaps — pull each card's end forward to the next card's start
// so transitions are seamless (no flicker).
for (let i = 0; i < cards.length - 1; i++) {
  cards[i].end = cards[i + 1].start;
}

console.log(`generated ${cards.length} cards`);

// Format an ASS timestamp from seconds
const toAss = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = (s % 60).toFixed(2).padStart(5, "0");
  return `${h}:${m.toString().padStart(2, "0")}:${sec}`;
};

// Render a single card to its dialogue text. Every word ALL-CAPS — the
// locked BlueJays caption standard, matching Hormozi's viral-clip pattern
// (maximum thumb-stoppage on vertical mobile feeds; color + size + caps
// stack for impact). Emphasis words stay sky-blue.
const renderCardText = (card) => {
  const cleanedWords = card.indices.map((idx) => {
    const w = words[idx].word.trim().toUpperCase();
    if (emphasizedIdx.has(idx)) {
      return `{\\c&HF8BD38&}${w}{\\rBJ}`;
    }
    return w;
  });
  return cleanedWords.join(" ").replace(/\s+/g, " ").trim();
};

const header = `[Script Info]
Title: BlueJays VSL #1 — karaoke captions (Whisper-synced)
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: BJ,Arial Black,92,&H00FFFFFF,&H00FFFFFF,&H00000000,&HA0000000,1,0,0,0,100,100,0,0,1,7,4,8,60,60,220,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

const dialogues = cards
  .map(
    (c) =>
      `Dialogue: 0,${toAss(c.start)},${toAss(c.end)},BJ,,0,0,0,,${renderCardText(c)}`,
  )
  .join("\n");

fs.writeFileSync(OUT_PATH, header + dialogues + "\n", "utf8");
console.log(`wrote ${OUT_PATH} (${cards.length} cards)`);

// Print all cards for inspection
cards.forEach((c, i) => {
  const text = c.indices.map((idx) => words[idx].word.trim()).join(" ");
  console.log(`  ${i + 1}. [${c.start.toFixed(2)}s - ${c.end.toFixed(2)}s] ${text}`);
});
