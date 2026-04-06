import type { Prospect } from "./types";
import { updateProspect } from "./store";
import { sendEmail, getEmailHistory } from "./email-sender";
import {
  getPitchEmail,
  getFollowUp1,
  getFollowUp2,
} from "./email-templates";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function sendPitchEmail(prospect: Prospect) {
  if (!prospect.email) {
    throw new Error(`No email address for ${prospect.businessName}`);
  }
  if (!prospect.generatedSiteUrl) {
    throw new Error(`No preview site generated for ${prospect.businessName}`);
  }

  const previewUrl = `${BASE_URL}${prospect.generatedSiteUrl}`;

  // Check what sequence we're on
  const history = await getEmailHistory(prospect.id);
  const lastSequence = history.length > 0
    ? Math.max(...history.map((e) => e.sequence))
    : 0;

  let template;
  if (lastSequence === 0) {
    template = getPitchEmail(prospect, previewUrl);
  } else if (lastSequence === 1) {
    template = getFollowUp1(prospect, previewUrl);
  } else if (lastSequence === 2) {
    template = getFollowUp2(prospect, previewUrl);
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
