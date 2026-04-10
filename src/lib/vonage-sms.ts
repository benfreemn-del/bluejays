const VONAGE_API_KEY = process.env.VONAGE_API_KEY;
const VONAGE_API_SECRET = process.env.VONAGE_API_SECRET;
const VONAGE_PHONE_NUMBER = process.env.VONAGE_PHONE_NUMBER;
const VONAGE_SMS_ENDPOINT = "https://rest.nexmo.com/sms/json";

export interface VonageSendResult {
  ok: boolean;
  messageId?: string;
  error?: string;
  status?: string;
  raw?: unknown;
}

interface VonageSmsMessageResponse {
  status?: string;
  "message-id"?: string;
  "error-text"?: string;
  "remaining-balance"?: string;
  "message-price"?: string;
  network?: string;
}

interface VonageSmsResponse {
  "message-count"?: string;
  messages?: VonageSmsMessageResponse[];
}

export function isVonageConfigured(): boolean {
  return !!(VONAGE_API_KEY && VONAGE_API_SECRET && VONAGE_PHONE_NUMBER);
}

export function getVonagePhoneNumber(): string | undefined {
  return VONAGE_PHONE_NUMBER;
}

export async function sendViaVonage(to: string, body: string): Promise<VonageSendResult> {
  if (!isVonageConfigured()) {
    return {
      ok: false,
      error: "Vonage SMS is not configured",
    };
  }

  try {
    const response = await fetch(VONAGE_SMS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        api_key: VONAGE_API_KEY!,
        api_secret: VONAGE_API_SECRET!,
        from: VONAGE_PHONE_NUMBER!,
        to,
        text: body,
      }),
    });

    const rawText = await response.text();
    let data: VonageSmsResponse | null = null;

    try {
      data = rawText ? JSON.parse(rawText) as VonageSmsResponse : null;
    } catch {
      data = null;
    }

    if (!response.ok) {
      const error = `Vonage HTTP ${response.status}: ${rawText || response.statusText}`;
      console.error("[SMS][Vonage] Request failed:", error);
      return {
        ok: false,
        error,
        raw: data ?? rawText,
      };
    }

    const message = data?.messages?.[0];
    if (!message) {
      const error = "Vonage response did not include a message result";
      console.error("[SMS][Vonage] Invalid response:", data);
      return {
        ok: false,
        error,
        raw: data,
      };
    }

    if (message.status !== "0") {
      const error = message["error-text"] || `Vonage send failed with status ${message.status || "unknown"}`;
      console.error("[SMS][Vonage] Provider error:", {
        status: message.status,
        error,
        messageId: message["message-id"],
      });
      return {
        ok: false,
        error,
        status: message.status,
        messageId: message["message-id"],
        raw: data,
      };
    }

    console.log("[SMS][Vonage] Message sent", {
      to,
      messageId: message["message-id"],
      status: message.status,
    });

    return {
      ok: true,
      messageId: message["message-id"],
      status: message.status,
      raw: data,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Vonage SMS error";
    console.error("[SMS][Vonage] Unexpected error:", error);
    return {
      ok: false,
      error: message,
    };
  }
}
