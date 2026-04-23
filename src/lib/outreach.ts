import type { Prospect } from "./types";
import { updateProspect } from "./store";
import { sendEmail, getEmailHistory } from "./email-sender";
import {
  getPitchEmail,
  getFollowUp1,
  getFollowUp2,
} from "./email-templates";
import { getProspectVideoUrl } from "./video-generator";

// Strip any accidentally embedded query params from the base URL env var
const _rawBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const BASE_URL = _rawBaseUrl.split("?")[0].replace(/\/$/, "");

/**
 * Statuses that indicate a prospect has passed quality review and is
 * eligible to receive outreach emails. Prospects still in "scouted" or
 * "scraped" status have NOT been reviewed and should not be contacted.
 */
const OUTREACH_ELIGIBLE_STATUSES = [
  "pending-review",
  "reviewed",
  "contacted",
  "responded",
  "paid",
];

export async function sendPitchEmail(prospect: Prospect) {
  if (!prospect.email) {
    throw new Error(`No email address for ${prospect.businessName}`);
  }
  if (!prospect.generatedSiteUrl) {
    throw new Error(`No preview site generated for ${prospect.businessName}`);
  }

  // Quality gate: verify the prospect has passed quality review before sending
  if (!OUTREACH_ELIGIBLE_STATUSES.includes(prospect.status)) {
    throw new Error(
      `Cannot send pitch to ${prospect.businessName}: status is "${prospect.status}" — must pass quality review first (status should be "pending-review" or better)`
    );
  }

  const previewUrl = `${BASE_URL}/p/${prospect.id.slice(0, 8)}`;
  const videoUrl = await getProspectVideoUrl(prospect.id);

  // Check what sequence we're on
  const history = await getEmailHistory(prospect.id);
  const lastSequence = history.length > 0
    ? Math.max(...history.map((e) => e.sequence))
    : 0;

  let template;
  if (lastSequence === 0) {
    template = getPitchEmail(prospect, previewUrl, videoUrl);
  } else if (lastSequence === 1) {
    template = getFollowUp1(prospect, previewUrl, videoUrl);
  } else if (lastSequence === 2) {
    template = getFollowUp2(prospect, previewUrl, videoUrl);
  } else {
    throw new Error(
      `All 3 emails already sent to ${prospect.businessName}`
    );
  }

  const result = await sendEmail(
    prospect.id,
    prospect.email,
    template.subject,
    template.body,
    template.sequence
  );

  // Update prospect status
  if (prospect.status !== "responded" && prospect.status !== "paid") {
    await updateProspect(prospect.id, { status: "contacted" });
  }

  return result;
}
