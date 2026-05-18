/**
 * POST /api/touches/voice-transcribe
 *
 * Accepts an audio blob (typically a 30-sec phone recording from the
 * TouchButtons voice-memo mic), transcribes via OpenAI Whisper, returns
 * the text. The client then puts the transcript into the touch's `notes`
 * field and POSTs to /api/prospects/[id]/touches like a normal log call.
 *
 * Body: multipart/form-data with an `audio` file part (webm/m4a/wav/mp3
 * up to ~25MB).
 *
 * Cost: ~$0.006/min via Whisper API. Logged via logCost().
 * Pattern: bluejays/docs/playbooks/lead-interaction-system-master-plan.md
 *
 * Operator-only — protected by middleware.
 */

import { NextRequest, NextResponse } from "next/server";
import { logCost } from "@/lib/cost-logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const WHISPER_MODEL = "whisper-1";
const MAX_AUDIO_BYTES = 25 * 1024 * 1024; // 25MB Whisper limit

export async function POST(request: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { ok: false, error: "OPENAI_API_KEY not configured" },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Expected multipart/form-data with `audio` file" },
      { status: 400 },
    );
  }

  const audio = formData.get("audio");
  if (!audio || typeof audio === "string") {
    return NextResponse.json(
      { ok: false, error: "Missing `audio` file part" },
      { status: 400 },
    );
  }

  const file = audio as File;
  if (file.size > MAX_AUDIO_BYTES) {
    return NextResponse.json(
      { ok: false, error: `Audio too large: ${file.size} bytes (max ${MAX_AUDIO_BYTES})` },
      { status: 413 },
    );
  }

  // Forward to OpenAI Whisper
  const upstream = new FormData();
  upstream.append("file", file, file.name || "audio.webm");
  upstream.append("model", WHISPER_MODEL);
  upstream.append("response_format", "json");
  // English-only optimization (BlueJays operators speak English); skip
  // language-detection round trip
  upstream.append("language", "en");

  try {
    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: upstream,
    });

    if (!r.ok) {
      const errBody = await r.text().catch(() => "");
      console.error(`[voice-transcribe] OpenAI HTTP ${r.status}:`, errBody.slice(0, 300));
      return NextResponse.json(
        { ok: false, error: `Whisper error: HTTP ${r.status}` },
        { status: 502 },
      );
    }

    type WhisperResp = { text?: string };
    const data = (await r.json()) as WhisperResp;
    const text = (data.text || "").trim();

    // Log cost — Whisper is $0.006/min. We don't know the duration
    // without decoding the audio; approximate at 30 sec for the typical
    // voice-memo use case ($0.003 per call).
    await logCost({
      service: "openai",
      action: "whisper_transcribe",
      costUsd: 0.003,
      metadata: { bytes: file.size, text_chars: text.length },
    }).catch(() => {});

    return NextResponse.json({ ok: true, text });
  } catch (err) {
    console.error("[voice-transcribe] exception:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Transcribe failed" },
      { status: 500 },
    );
  }
}
