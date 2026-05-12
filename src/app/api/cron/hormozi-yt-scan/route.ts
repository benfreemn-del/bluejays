import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

/**
 * GET /api/cron/hormozi-yt-scan
 *
 * Daily cron (08:30 UTC). Polls the YouTube Data API v3 for recent
 * Alex Hormozi videos and logs new ones into hormozi_yt_scans.
 *
 * Why metadata-only for v1: the YouTube Captions API requires OAuth
 * per video owner; we can't fetch transcripts directly. We log
 * title + description + URL so the diagnostic agent can cite recent
 * videos by name, and a separate manual step (scripts/ingest-hormozi-kb.mjs)
 * pulls the transcript for any high-value videos worth full ingestion.
 *
 * Auth: gated by CRON_SECRET (Bearer header). Returns 401 otherwise.
 * Mock-safe: when YOUTUBE_API_KEY is unset, returns ok:true with a
 * note so Vercel logs stay clean.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Hormozi's primary YouTube channel (Alex Hormozi). Acquisition.com is
// the secondary. Add channels here as Ben finds them.
const CHANNEL_IDS = [
  "UCxw7m2NHIHvBe-OY8FtA60Q", // Alex Hormozi
  "UCSe0eqDZ9JlYQYwOmAB3hcA", // Acquisition.com
];

interface YtVideoItem {
  id: { videoId: string };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    channelTitle: string;
    thumbnails: { medium?: { url: string }; high?: { url: string } };
  };
}

function isAuthed(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return true; // local dev — allow
  const header = req.headers.get("authorization");
  return header === `Bearer ${expected}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "YOUTUBE_API_KEY not configured",
      found: 0,
      ingested: 0,
    });
  }

  const sb = getSupabase();
  const sinceIso = new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString();
  let found = 0;
  let ingested = 0;
  const errors: string[] = [];

  for (const channelId of CHANNEL_IDS) {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("channelId", channelId);
    url.searchParams.set("order", "date");
    url.searchParams.set("type", "video");
    url.searchParams.set("publishedAfter", sinceIso);
    url.searchParams.set("maxResults", "10");
    url.searchParams.set("key", apiKey);

    try {
      const resp = await fetch(url.toString());
      if (!resp.ok) {
        errors.push(`channel ${channelId}: HTTP ${resp.status}`);
        continue;
      }
      const data = (await resp.json()) as { items?: YtVideoItem[] };
      const items = data.items ?? [];
      found += items.length;

      for (const it of items) {
        const videoId = it.id?.videoId;
        if (!videoId) continue;

        // Dedupe — unique constraint on video_id makes this safe even
        // if we race ourselves, but checking first avoids a noisy log
        // on the conflict path.
        const { data: existing } = await sb
          .from("hormozi_yt_scans")
          .select("id")
          .eq("video_id", videoId)
          .maybeSingle();
        if (existing) continue;

        const thumb =
          it.snippet.thumbnails?.high?.url ??
          it.snippet.thumbnails?.medium?.url ??
          null;

        await sb.from("hormozi_yt_scans").insert({
          video_id: videoId,
          channel_id: it.snippet.channelId,
          channel_title: it.snippet.channelTitle,
          title: it.snippet.title,
          description: it.snippet.description,
          published_at: it.snippet.publishedAt,
          thumbnail_url: thumb,
          transcript_status: "metadata_only",
        });

        // Also insert as a KB chunk so the diagnostic agent can cite
        // the video. Marked source_kind='youtube' even though it's
        // metadata-only — the title + description is often enough for
        // a Hormozi diagnostic to reference recent thinking.
        const kbContent = `${it.snippet.title}\n\nhttps://youtu.be/${videoId}\n\n${it.snippet.description}`;
        const { data: kb } = await sb
          .from("hormozi_kb_chunks")
          .insert({
            title: it.snippet.title,
            source_kind: "youtube",
            source_url: `https://youtu.be/${videoId}`,
            topic_tags: ["recent", "youtube"],
            content: kbContent,
          })
          .select("id")
          .single();

        if (kb) {
          await sb
            .from("hormozi_yt_scans")
            .update({ ingested_as_kb: true, kb_chunk_id: kb.id })
            .eq("video_id", videoId);
        }
        ingested += 1;
      }
    } catch (e) {
      errors.push(`channel ${channelId}: ${(e as Error).message}`);
    }
  }

  return NextResponse.json({
    ok: errors.length === 0,
    found,
    ingested,
    errors,
    sinceIso,
  });
}
