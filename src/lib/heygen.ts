/**
 * HeyGen integration — generate a per-prospect 30-sec explainer video
 * to play on the audit-results page (Batch 13).
 *
 * Pattern: caller supplies businessName + ownerFirstName + category +
 * top-3 audit findings. We POST to HeyGen v2 /video/generate with a
 * scripted line and an avatar/voice ID, get back a video_id, then
 * poll /video_status/[id] until status='completed' and grab the
 * video_url. Caller stamps the URL on site_audits.heygen_video_url.
 *
 * Env vars (set on Vercel):
 *   HEYGEN_API_KEY              required (no key → soft no-op, returns null)
 *   HEYGEN_AVATAR_ID            required (the avatar to render)
 *   HEYGEN_VOICE_ID             required (the voice to use)
 *   HEYGEN_TEMPLATE_ID          optional (pre-built template; if set,
 *                               uses /template/{id}/generate instead
 *                               of raw video/generate so the visual
 *                               layout stays branded)
 *
 * Soft no-op design: if any required env is missing, generate() returns
 * null. Callers handle null by simply NOT showing the video on the audit
 * page (the existing AuditCTAHub still renders without it). This lets
 * us ship the integration ahead of Ben buying a HeyGen subscription —
 * code is in place, env flip flips it on.
 *
 * Cost: HeyGen Pro is $89/mo for 30 video credits. ~$3 per personalized
 * video. Worth it on a $10,000 close — even a 1% lift over the static
 * audit page covers the subscription many times over.
 */

const HEYGEN_BASE = "https://api.heygen.com";

export type HeyGenScript = {
  businessName: string;
  ownerFirstName?: string;
  category?: string;
  /** Top 3 findings from the audit (one short line each). */
  findings?: string[];
};

/** Build the spoken script for a single prospect. ~30 seconds when
 *  delivered at ~150 WPM (≈75 words). */
export function buildScript(s: HeyGenScript): string {
  const name = s.ownerFirstName || `the ${s.businessName} team`;
  const cat = (s.category || "local business").replace(/-/g, " ");
  const findings = (s.findings || []).filter(Boolean).slice(0, 3);

  const findingLines =
    findings.length > 0
      ? findings.map((f, i) => `Issue ${i + 1}. ${f}`).join(" ")
      : `Three things stood out — your headline, your call-to-action placement, and your local SEO setup.`;

  return [
    `Hi ${name} — I'm Ben from BlueJays.`,
    `I just looked at ${s.businessName}'s site for you. Quick walkthrough:`,
    findingLines,
    `If we score below 60, I'll rebuild your site for $997. You see it BEFORE you pay. Don't love it, you don't pay a cent.`,
    `Scroll down for the full report. Talk soon.`,
  ].join(" ");
}

type HeyGenGenerateResponse = {
  data?: { video_id?: string; status?: string };
  error?: { message?: string };
};

type HeyGenStatusResponse = {
  data?: {
    status?: "processing" | "completed" | "failed" | "pending";
    video_url?: string;
    error?: string;
  };
};

/**
 * Trigger a video generation job. Returns the HeyGen video_id on
 * success, or null on misconfiguration / failure.
 *
 * NOT awaited for completion — videos take 30-90 seconds to render.
 * The caller (route handler) writes the video_id to the audit row,
 * then a separate poll/cron picks it up + flips video_url when ready.
 */
export async function generateVideo(
  script: HeyGenScript,
): Promise<{ videoId: string; spokenScript: string } | null> {
  const apiKey = process.env.HEYGEN_API_KEY;
  const avatarId = process.env.HEYGEN_AVATAR_ID;
  const voiceId = process.env.HEYGEN_VOICE_ID;
  const templateId = process.env.HEYGEN_TEMPLATE_ID;

  if (!apiKey || !avatarId || !voiceId) {
    // Soft no-op — env not configured. Caller skips video gracefully.
    return null;
  }

  const spokenScript = buildScript(script);

  // Two paths: template-based (preferred for branded look) or raw
  // video/generate. Template path is cleaner — Ben sets the layout
  // once in HeyGen's web UI, then we just substitute variables.
  const url = templateId
    ? `${HEYGEN_BASE}/v2/template/${templateId}/generate`
    : `${HEYGEN_BASE}/v2/video/generate`;

  const body = templateId
    ? {
        // Template variables — names match what Ben sets up in the
        // HeyGen template editor.
        variables: {
          first_name: { name: "first_name", type: "text", properties: { content: script.ownerFirstName || "there" } },
          business: { name: "business", type: "text", properties: { content: script.businessName } },
          script: { name: "script", type: "text", properties: { content: spokenScript } },
        },
      }
    : {
        // Raw generation — manual avatar + voice + script.
        video_inputs: [
          {
            character: { type: "avatar", avatar_id: avatarId, avatar_style: "normal" },
            voice: { type: "text", voice_id: voiceId, input_text: spokenScript },
          },
        ],
        dimension: { width: 1280, height: 720 },
      };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify(body),
    });
    const j = (await res.json().catch(() => ({}))) as HeyGenGenerateResponse;
    if (!res.ok || !j.data?.video_id) {
      console.warn("[heygen] generate failed:", res.status, j.error?.message);
      return null;
    }
    return { videoId: j.data.video_id, spokenScript };
  } catch (err) {
    console.error("[heygen] generate threw:", err);
    return null;
  }
}

/**
 * Poll for video completion. Returns the public video URL when ready,
 * null if still processing, or 'failed' on a terminal error.
 *
 * Caller is expected to invoke this from a polling cron — typical
 * render takes 30-90s, so a 5-minute polling window is plenty.
 */
export async function pollVideoStatus(
  videoId: string,
): Promise<{ status: "completed"; videoUrl: string } | { status: "processing" } | { status: "failed"; reason: string } | null> {
  const apiKey = process.env.HEYGEN_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `${HEYGEN_BASE}/v1/video_status.get?video_id=${encodeURIComponent(videoId)}`,
      { headers: { "X-Api-Key": apiKey } },
    );
    const j = (await res.json().catch(() => ({}))) as HeyGenStatusResponse;
    const status = j.data?.status;
    if (status === "completed" && j.data?.video_url) {
      return { status: "completed", videoUrl: j.data.video_url };
    }
    if (status === "failed") {
      return { status: "failed", reason: j.data?.error || "unknown" };
    }
    if (status === "processing" || status === "pending") {
      return { status: "processing" };
    }
    return null;
  } catch (err) {
    console.error("[heygen] poll threw:", err);
    return null;
  }
}
