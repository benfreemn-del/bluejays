import fs from "fs";
import os from "os";
import path from "path";
import { spawn } from "child_process";
import { readFile, rm, writeFile } from "fs/promises";

import chromium from "@sparticuz/chromium";
import ffmpegBinary from "ffmpeg-static";
import { parseFile } from "music-metadata";
import OpenAI from "openai";
import puppeteer, { type Browser } from "puppeteer-core";

import type { GeneratedSiteData } from "./generator";
import { getAllProspects, getProspect, getScrapedData } from "./store";
import { isSupabaseConfigured, supabase } from "./supabase";
import type { Prospect } from "./types";
import { generateVslScript } from "./vsl-generator";

const VIDEO_BUCKET = process.env.SUPABASE_VIDEO_BUCKET || "generated-videos";
const VIDEO_WIDTH = 1440;
const VIDEO_HEIGHT = 900;
const MIN_VIDEO_SECONDS = 60;
const MAX_VIDEO_SECONDS = 90;
const HERO_PAUSE_SECONDS = 5;
const SECTION_PAUSE_SECONDS = 4;
const OUTRO_PAUSE_SECONDS = 4;
const TARGET_VOICE = process.env.OPENAI_TTS_VOICE || "alloy";
const TARGET_TTS_MODEL = process.env.OPENAI_TTS_MODEL || "tts-1";

// -- Runtime ffmpeg binary ---------------------------------------------------
// Vercel's file tracer refuses to bundle ffmpeg-static's binary regardless of
// includeFiles / outputFileTracingIncludes patterns we've tried (the binary is
// resolved at build time to a pnpm path but never copied into the function).
// Plan B: download a prebuilt static ffmpeg binary into /tmp on first call.
// /tmp has 512MB on Vercel and persists for the lifetime of a warm container,
// so subsequent calls on the same instance skip the download.
const FFMPEG_RUNTIME_URL = "https://github.com/eugeneware/ffmpeg-static/releases/download/b6.0/ffmpeg-linux-x64";
const FFMPEG_RUNTIME_PATH = "/tmp/ffmpeg-bluejays";

async function ensureFfmpegAvailable(): Promise<string> {
  // If the package's own ffmpeg path resolves AND exists (local dev / future
  // Vercel fix), use it. Skips the ~5s /tmp download on local dev.
  if (ffmpegBinary && fs.existsSync(ffmpegBinary)) {
    try { fs.chmodSync(ffmpegBinary, 0o755); } catch { /* ignore */ }
    return ffmpegBinary;
  }

  // Already downloaded and still warm → reuse.
  if (fs.existsSync(FFMPEG_RUNTIME_PATH)) {
    try { fs.chmodSync(FFMPEG_RUNTIME_PATH, 0o755); } catch { /* ignore */ }
    return FFMPEG_RUNTIME_PATH;
  }

  console.log(`[video-generator] Downloading ffmpeg to ${FFMPEG_RUNTIME_PATH}...`);
  const started = Date.now();
  const res = await fetch(FFMPEG_RUNTIME_URL, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(`Failed to download ffmpeg runtime: HTTP ${res.status} from ${FFMPEG_RUNTIME_URL}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(FFMPEG_RUNTIME_PATH, buf);
  fs.chmodSync(FFMPEG_RUNTIME_PATH, 0o755);
  console.log(`[video-generator] ffmpeg downloaded in ${Date.now() - started}ms (${buf.length} bytes)`);
  return FFMPEG_RUNTIME_PATH;
}

export type VideoStatus = "not_started" | "queued" | "generating" | "ready" | "failed" | "preview_missing";

export interface ProspectVideoStatus {
  prospectId: string;
  businessName: string;
  category: string;
  city: string;
  generatedSiteUrl?: string;
  hasGeneratedSite: boolean;
  videoStatus: VideoStatus;
  videoUrl?: string;
  videoStoragePath?: string;
  videoDurationSeconds?: number;
  videoGeneratedAt?: string;
  videoError?: string;
}

interface VideoMetadataRow {
  prospect_id: string;
  video_url: string | null;
  video_status: VideoStatus | null;
  video_storage_path: string | null;
  video_duration_seconds: number | null;
  video_generated_at: string | null;
  video_error: string | null;
}

interface DetectedSection {
  label: string;
  y: number;
}

interface CapturePlan {
  sections: DetectedSection[];
  documentHeight: number;
  maxScrollY: number;
}

interface ScrollSegment {
  startY: number;
  endY: number;
  duration: number;
}

export interface GeneratedVideoResult {
  prospectId: string;
  videoUrl: string;
  storagePath: string;
  durationSeconds: number;
  narrationScript: string;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function toSentence(text: string, sentenceCount = 1) {
  const sentences = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  return sentences.slice(0, sentenceCount).join(" ");
}

function normalizeScriptText(text: string) {
  return text
    .replace(/===.*?===/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?])/g, "$1")
    .trim();
}

function wordCount(text: string) {
  return text.split(/\s+/).filter(Boolean).length;
}

function estimateDurationSecondsFromWords(text: string) {
  return Math.round((wordCount(text) / 150) * 60);
}

function trimToWordCount(text: string, maxWords: number) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return `${words.slice(0, maxWords).join(" ")}.`;
}

function buildNarrationScript(prospect: Prospect, siteData: GeneratedSiteData): string {
  const vsl = generateVslScript(prospect);
  const intro = `${prospect.ownerName?.split(" ")[0] || prospect.businessName}, I wanted to show you the custom website preview we built for ${prospect.businessName}.`;
  const hook = toSentence(vsl.hook, 1);
  const services = siteData.services.slice(0, 3).map((service) => service.name).filter(Boolean);
  const servicesLine = services.length > 0
    ? `As you scroll, you can see how the site highlights ${services.join(", ")} with clear calls to action that make it easy for customers to reach out.`
    : `As you scroll, you can see how the site is structured to guide visitors from first impression to inquiry with clear calls to action on every section.`;

  const ratingLine = prospect.googleRating
    ? `${prospect.businessName} already has strong social proof with a ${prospect.googleRating}-star rating${prospect.reviewCount ? ` across ${prospect.reviewCount} reviews` : ""}, so we made sure that credibility is visible right away.`
    : `We also built in trust elements so visitors immediately understand why ${prospect.businessName} is the safe choice in ${prospect.city}.`;

  const testimonial = siteData.testimonials[0]?.text?.trim();
  const testimonialLine = testimonial
    ? `Further down, the testimonial section reinforces that trust with real customer feedback, including highlights like, ${trimToWordCount(testimonial.replace(/"/g, ""), 18)}`
    : `Further down, the proof section reinforces trust with customer-focused messaging, supporting stats, and a layout designed to convert mobile visitors.`;

  const offer = `${toSentence(vsl.solution, 1)} The layout is mobile-friendly, fast, and tailored to the services people are already searching for in ${prospect.city}.`;
  const cta = `If this feels like the direction you want to take, BlueJays can launch a polished version for ${prospect.businessName} on your own domain fast.`;

  const full = normalizeScriptText([
    intro,
    hook,
    offer,
    servicesLine,
    ratingLine,
    testimonialLine,
    cta,
  ].join(" "));

  const desiredMaxWords = 205;
  const desiredMinWords = 145;
  const trimmed = trimToWordCount(full, desiredMaxWords);

  if (wordCount(trimmed) >= desiredMinWords) {
    return trimmed;
  }

  const fallback = normalizeScriptText(`${trimmed} We built this preview to show how much stronger your online presence can feel when the design, copy, and trust signals all work together. The final section closes with a simple path for visitors to call, book, or request a quote without friction.`);
  return trimToWordCount(fallback, desiredMaxWords);
}

function findNarrationTargetDuration(script: string) {
  return clamp(estimateDurationSecondsFromWords(script), MIN_VIDEO_SECONDS, MAX_VIDEO_SECONDS);
}

async function getBrowserExecutablePath() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;
  if (process.env.CHROME_EXECUTABLE_PATH) return process.env.CHROME_EXECUTABLE_PATH;

  try {
    const executablePath = await chromium.executablePath();
    if (executablePath) return executablePath;
  } catch (error) {
    console.warn("[video-generator] Falling back to system Chromium", error);
  }

  const candidates = ["/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome"];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  throw new Error("No Chromium executable available for video capture");
}

async function launchCaptureBrowser(): Promise<Browser> {
  // Production path: Browserless.io (hosted Chrome as a service).
  // Set `BROWSERLESS_API_KEY` to your Browserless.io key and the video
  // pipeline connects remotely — bypassing Vercel's 250MB function size
  // limit that kills the @sparticuz/chromium bundled-binary approach.
  //
  // Local dev path: fallback to system Chromium / puppeteer-bundled.
  // Keeps `npm run dev` working without a Browserless subscription.
  const browserlessKey = process.env.BROWSERLESS_API_KEY;
  if (browserlessKey) {
    const wsEndpoint =
      `wss://production-sfo.browserless.io/chrome?token=${encodeURIComponent(browserlessKey)}` +
      `&--window-size=${VIDEO_WIDTH},${VIDEO_HEIGHT}` +
      // `stealth=true` = Browserless applies anti-bot-detection patches
      // so our screen captures don't get blocked by prospect sites that
      // reject obvious headless Chrome user-agents.
      `&stealth=true`;
    return puppeteer.connect({
      browserWSEndpoint: wsEndpoint,
      defaultViewport: {
        width: VIDEO_WIDTH,
        height: VIDEO_HEIGHT,
        deviceScaleFactor: 1,
      },
    }) as unknown as Browser;
  }

  const executablePath = await getBrowserExecutablePath();

  return puppeteer.launch({
    executablePath,
    headless: true,
    defaultViewport: {
      width: VIDEO_WIDTH,
      height: VIDEO_HEIGHT,
      deviceScaleFactor: 1,
    },
    args: Array.from(new Set([
      ...chromium.args,
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-background-networking",
      "--hide-scrollbars",
    ])),
  });
}

async function detectCapturePlan(previewUrl: string, outputDir: string): Promise<CapturePlan> {
  const browser = await launchCaptureBrowser();

  try {
    const page = await browser.newPage();
    await page.goto(previewUrl, {
      waitUntil: "networkidle2",
      timeout: 120_000,
    });

    await page.waitForSelector("body", { timeout: 30_000 });
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      document.documentElement.style.scrollBehavior = "auto";
      document.body.style.scrollBehavior = "auto";
    });
    await new Promise((resolve) => setTimeout(resolve, 3_000));

    const plan = await page.evaluate((viewportHeight) => {
      const normalize = (value: number, maxScroll: number) => Math.max(0, Math.min(value, maxScroll));
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - viewportHeight);

      const headingNodes = Array.from(document.querySelectorAll("h1, h2, h3, h4, section, article"));
      const candidates = headingNodes
        .map((node) => {
          const element = node as HTMLElement;
          const text = (element.innerText || element.textContent || "").trim().toLowerCase();
          const rect = element.getBoundingClientRect();
          const top = rect.top + window.scrollY;
          return { text, top };
        })
        .filter((candidate) => candidate.text.length > 0 && Number.isFinite(candidate.top));

      const findFirst = (keywords: string[], fallbackRatio: number, label: string) => {
        const match = candidates.find((candidate) => keywords.some((keyword) => candidate.text.includes(keyword)));
        const fallback = maxScroll * fallbackRatio;
        return { label, y: normalize(match?.top ?? fallback, maxScroll) };
      };

      const sections = [
        { label: "hero", y: 0 },
        findFirst(["about", "why choose", "our story"], 0.2, "about"),
        findFirst(["service", "what we do", "offerings", "solutions"], 0.4, "services"),
        findFirst(["testimonial", "review", "what clients say", "results"], 0.68, "testimonials"),
        { label: "bottom", y: maxScroll },
      ];

      const deduped = sections
        .sort((a, b) => a.y - b.y)
        .filter((section, index, list) => index === 0 || Math.abs(section.y - list[index - 1].y) > 160);

      return {
        sections: deduped,
        documentHeight: document.documentElement.scrollHeight,
        maxScrollY: maxScroll,
      };
    }, VIDEO_HEIGHT);

    // Cap the captured height. Some prospect previews are 15,000-20,000px
    // tall (general-contractor with team + gallery + testimonials + FAQ).
    // First attempt capped at 8000px but ffmpeg's split filter still OOM'd
    // the Lambda — `split` creates N parallel copies of the input frame in
    // memory, so 1440x8000 × 3 bytes × N segments (typically 4-5) = 500MB+.
    // Dropping to 4000px + bumping Lambda memory to 3008MB in vercel.json
    // gives enough headroom. 4000px still covers hero + 2 major sections,
    // which is what a 60-90s pitch video should focus on anyway.
    const MAX_CAPTURE_HEIGHT = 4000;
    const captureClipHeight = Math.min(plan.documentHeight, MAX_CAPTURE_HEIGHT);

    await page.screenshot({
      path: path.join(outputDir, "fullpage.png"),
      type: "png",
      clip: {
        x: 0,
        y: 0,
        width: VIDEO_WIDTH,
        height: captureClipHeight,
      },
    });

    // Also cap the capture plan's maxScrollY/documentHeight so the scroll
    // segments don't ask ffmpeg to crop past the actual image bottom
    // (would produce black bars or cause crop filter errors).
    plan.maxScrollY = Math.min(plan.maxScrollY, Math.max(0, captureClipHeight - VIDEO_HEIGHT));
    plan.documentHeight = captureClipHeight;
    plan.sections = plan.sections.filter((s) => s.y <= plan.maxScrollY);

    return plan;
  } finally {
    await browser.close();
  }
}

async function synthesizeNarration(script: string, outputPath: string) {
  const client = new OpenAI();
  const speech = await client.audio.speech.create({
    model: TARGET_TTS_MODEL,
    voice: TARGET_VOICE,
    response_format: "mp3",
    input: script,
  });

  const arrayBuffer = await speech.arrayBuffer();
  await writeFile(outputPath, Buffer.from(arrayBuffer));

  const metadata = await parseFile(outputPath);
  const duration = metadata.format.duration;
  if (!duration || Number.isNaN(duration)) {
    throw new Error("Unable to determine narration duration");
  }

  return duration;
}

function createScrollSegments(plan: CapturePlan, durationSeconds: number): ScrollSegment[] {
  const baseSections = plan.sections.length >= 2
    ? plan.sections
    : [
        { label: "hero", y: 0 },
        { label: "bottom", y: plan.maxScrollY },
      ];

  const pauseBudget = HERO_PAUSE_SECONDS + OUTRO_PAUSE_SECONDS + Math.max(0, baseSections.length - 2) * SECTION_PAUSE_SECONDS;
  const movementBudget = Math.max(durationSeconds - pauseBudget, 16);

  const movementDistances = baseSections.slice(1).map((section, index) => Math.abs(section.y - baseSections[index].y));
  const totalDistance = movementDistances.reduce((sum, distance) => sum + distance, 0) || baseSections.length - 1;

  const segments: ScrollSegment[] = [{ startY: baseSections[0].y, endY: baseSections[0].y, duration: HERO_PAUSE_SECONDS }];

  for (let index = 1; index < baseSections.length; index += 1) {
    const previous = baseSections[index - 1];
    const current = baseSections[index];
    const movementRatio = (movementDistances[index - 1] || 1) / totalDistance;
    const movementDuration = Number((movementBudget * movementRatio).toFixed(3));

    segments.push({
      startY: previous.y,
      endY: current.y,
      duration: Math.max(movementDuration, 4),
    });

    const isLast = index === baseSections.length - 1;
    segments.push({
      startY: current.y,
      endY: current.y,
      duration: isLast ? OUTRO_PAUSE_SECONDS : SECTION_PAUSE_SECONDS,
    });
  }

  return segments;
}

function escapeFilterExpression(value: string) {
  return value.replace(/'/g, "\\'");
}

async function runCommand(command: string, args: string[]) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: "pipe" });
    let stderr = "";

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr || `${command} failed with exit code ${code}`));
    });
  });
}

async function renderVideoFromPlan(imagePath: string, audioPath: string, outputPath: string, plan: CapturePlan, durationSeconds: number) {
  // Prefer FFMPEG_PATH env var (explicit override), then
  // ensureFfmpegAvailable() which falls back to /tmp runtime download on
  // serverless platforms where the bundled binary isn't available.
  const ffmpegPath = process.env.FFMPEG_PATH || await ensureFfmpegAvailable();
  if (!ffmpegPath) {
    throw new Error("FFmpeg binary is not available");
  }

  const segments = createScrollSegments(plan, durationSeconds);
  const splitOutputs = segments.map((_, index) => `[base${index}]`).join("");
  const segmentFilters = segments
    .map((segment, index) => {
      const delta = segment.endY - segment.startY;
      const duration = Number(segment.duration.toFixed(3));
      const yExpression = delta === 0
        ? `${segment.startY}`
        : `${segment.startY} + (${delta})*(t/${duration})`;

      // NOTE: We previously passed `eval=frame` to force per-frame evaluation
      // of the y expression, but the ffmpeg 6.0 static build we download at
      // runtime rejects it with "Option not found on crop filter". Modern
      // ffmpeg's crop filter already evaluates expressions containing `t`
      // (time) per-frame by default, so dropping `eval=frame` is safe and
      // keeps the scroll animation working.
      return `[base${index}]trim=duration=${duration},setpts=PTS-STARTPTS,crop=${VIDEO_WIDTH}:${VIDEO_HEIGHT}:0:'min(max(${escapeFilterExpression(yExpression)},0),max(0,ih-${VIDEO_HEIGHT}))',setsar=1[v${index}]`;
    })
    .join(";");

  const concatInputs = segments.map((_, index) => `[v${index}]`).join("");
  const totalDuration = segments.reduce((sum, segment) => sum + segment.duration, 0) + 1;

  const filterComplex = [
    `[0:v]scale=${VIDEO_WIDTH}:-1,split=${segments.length}${splitOutputs}`,
    segmentFilters,
    `${concatInputs}concat=n=${segments.length}:v=1:a=0,fps=30,format=yuv420p[outv]`,
  ].join(";");

  await runCommand(ffmpegPath, [
    "-y",
    "-loop",
    "1",
    "-t",
    `${totalDuration}`,
    "-i",
    imagePath,
    "-i",
    audioPath,
    "-filter_complex",
    filterComplex,
    "-map",
    "[outv]",
    "-map",
    "1:a:0",
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "23",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-movflags",
    "+faststart",
    "-shortest",
    outputPath,
  ]);
}

async function ensureVideoBucket() {
  if (!isSupabaseConfigured()) return;

  const { error } = await supabase.storage.createBucket(VIDEO_BUCKET, {
    public: true,
    fileSizeLimit: 50 * 1024 * 1024,
    allowedMimeTypes: ["video/mp4"],
  });

  if (error && !/already exists|duplicate/i.test(error.message)) {
    throw error;
  }
}

async function updateVideoMetadata(
  prospectId: string,
  updates: Record<string, unknown>,
  siteData?: object | null,
) {
  if (!isSupabaseConfigured()) return;

  const { data: existingRows, error: selectError } = await supabase
    .from("generated_sites")
    .select("prospect_id")
    .eq("prospect_id", prospectId)
    .limit(1);

  if (selectError) throw selectError;

  if (existingRows && existingRows.length > 0) {
    const { error } = await supabase
      .from("generated_sites")
      .update(updates)
      .eq("prospect_id", prospectId);

    if (error) throw error;
    return;
  }

  const payload = {
    prospect_id: prospectId,
    site_data: siteData || {},
    ...updates,
  };

  const { error } = await supabase.from("generated_sites").insert(payload);
  if (error) throw error;
}

async function uploadGeneratedVideo(prospectId: string, filePath: string) {
  if (!isSupabaseConfigured()) {
    return {
      publicUrl: `file://${filePath}`,
      storagePath: filePath,
    };
  }

  await ensureVideoBucket();

  const fileBuffer = await readFile(filePath);
  const storagePath = `prospects/${prospectId}/${Date.now()}.mp4`;

  const { error } = await supabase.storage
    .from(VIDEO_BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: "video/mp4",
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(VIDEO_BUCKET).getPublicUrl(storagePath);
  if (!data.publicUrl) {
    throw new Error("Failed to generate public URL for uploaded video");
  }

  return {
    publicUrl: data.publicUrl,
    storagePath,
  };
}

function toAbsolutePreviewUrl(relativeOrAbsoluteUrl: string) {
  if (/^https?:\/\//i.test(relativeOrAbsoluteUrl)) return relativeOrAbsoluteUrl;

  // Source the base URL. Vercel's auto-injected `VERCEL_PROJECT_PRODUCTION_URL`
  // is a BARE HOSTNAME like `bluejays.vercel.app` (NO protocol), so we must
  // normalize — otherwise Chrome navigates to "bluejays.vercel.app/preview/..."
  // which is not a valid URL and Browserless throws
  // "Protocol error (Page.navigate): Cannot navigate to invalid URL".
  // The fallback explicit URL also ensures the apex domain wins over any
  // preview-branch URL, which is what customer-facing screenshots want.
  let baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    "https://bluejayportfolio.com";
  baseUrl = baseUrl.replace(/\/$/, "");
  if (!/^https?:\/\//i.test(baseUrl)) {
    baseUrl = `https://${baseUrl}`;
  }

  return `${baseUrl}${relativeOrAbsoluteUrl.startsWith("/") ? relativeOrAbsoluteUrl : `/${relativeOrAbsoluteUrl}`}`;
}

export async function listProspectVideoStatuses(): Promise<ProspectVideoStatus[]> {
  const prospects = await getAllProspects();
  let videoRows: VideoMetadataRow[] = [];

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("generated_sites")
      .select("prospect_id, video_url, video_status, video_storage_path, video_duration_seconds, video_generated_at, video_error");

    if (error) throw error;
    videoRows = (data || []) as VideoMetadataRow[];
  }

  const rowMap = new Map(videoRows.map((row) => [row.prospect_id, row]));

  return prospects.map((prospect) => {
    const row = rowMap.get(prospect.id);
    const hasGeneratedSite = !!prospect.generatedSiteUrl;
    const videoStatus = hasGeneratedSite
      ? (row?.video_status || "not_started")
      : "preview_missing";

    return {
      prospectId: prospect.id,
      businessName: prospect.businessName,
      category: prospect.category,
      city: prospect.city,
      generatedSiteUrl: prospect.generatedSiteUrl,
      hasGeneratedSite,
      videoStatus,
      videoUrl: row?.video_url || undefined,
      videoStoragePath: row?.video_storage_path || undefined,
      videoDurationSeconds: row?.video_duration_seconds || undefined,
      videoGeneratedAt: row?.video_generated_at || undefined,
      videoError: row?.video_error || undefined,
    };
  });
}

export async function getProspectVideoUrl(prospectId: string): Promise<string | undefined> {
  if (!isSupabaseConfigured()) return undefined;

  const { data, error } = await supabase
    .from("generated_sites")
    .select("video_url")
    .eq("prospect_id", prospectId)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.video_url || undefined;
}

export async function generateProspectVideo(prospectId: string): Promise<GeneratedVideoResult> {
  const prospect = await getProspect(prospectId);
  if (!prospect) {
    throw new Error("Prospect not found");
  }

  if (!prospect.generatedSiteUrl) {
    await updateVideoMetadata(prospectId, {
      video_status: "preview_missing",
      video_error: "Generate the preview site before generating a video.",
    });
    throw new Error("Preview site is not ready for this prospect");
  }

  const siteData = await getScrapedData(prospectId) as GeneratedSiteData | null;
  if (!siteData) {
    await updateVideoMetadata(prospectId, {
      video_status: "preview_missing",
      video_error: "Generated site data could not be loaded.",
    });
    throw new Error("Generated site data is missing");
  }

  const previewUrl = toAbsolutePreviewUrl(prospect.generatedSiteUrl);
  const narrationScript = buildNarrationScript(prospect, siteData);

  await updateVideoMetadata(prospectId, {
    video_status: "generating",
    video_error: null,
    video_script: narrationScript,
  }, siteData);

  const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), `bluejays-video-${prospectId}-`));

  try {
    const audioPath = path.join(tempDir, "narration.mp3");
    const imagePath = path.join(tempDir, "fullpage.png");
    const outputPath = path.join(tempDir, "video.mp4");

    const [capturePlan, audioDuration] = await Promise.all([
      detectCapturePlan(previewUrl, tempDir),
      synthesizeNarration(narrationScript, audioPath),
    ]);

    const targetDuration = clamp(Math.round(audioDuration), MIN_VIDEO_SECONDS, MAX_VIDEO_SECONDS);

    if (!fs.existsSync(imagePath)) {
      throw new Error("Preview capture failed to produce the page image");
    }

    await renderVideoFromPlan(imagePath, audioPath, outputPath, capturePlan, targetDuration || findNarrationTargetDuration(narrationScript));

    const upload = await uploadGeneratedVideo(prospectId, outputPath);
    const generatedAt = new Date().toISOString();

    await updateVideoMetadata(prospectId, {
      video_url: upload.publicUrl,
      video_storage_path: upload.storagePath,
      video_status: "ready",
      video_error: null,
      video_script: narrationScript,
      video_duration_seconds: targetDuration,
      video_generated_at: generatedAt,
    }, siteData);

    return {
      prospectId,
      videoUrl: upload.publicUrl,
      storagePath: upload.storagePath,
      durationSeconds: targetDuration,
      narrationScript,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Video generation failed";

    await updateVideoMetadata(prospectId, {
      video_status: "failed",
      video_error: message,
      video_generated_at: null,
    }, siteData);

    throw error;
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}
