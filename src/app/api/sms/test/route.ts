import { NextRequest, NextResponse } from "next/server";
import { checkSessionCookie, validateAuth } from "@/lib/auth";
import { getActiveSmsProviderPreference, getConfiguredSmsProviders, sendSms } from "@/lib/sms";

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cookie = request.cookies.get("bluejays_auth")?.value;
  return validateAuth(authHeader) || checkSessionCookie(cookie);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const to = typeof body?.to === "string" ? body.to.trim() : "";
    const message = typeof body?.body === "string" ? body.body.trim() : "";

    if (!to || !message) {
      return NextResponse.json(
        { error: "Missing required fields: to, body" },
        { status: 400 }
      );
    }

    const result = await sendSms(`sms-test-${Date.now()}`, to, message, 0);

    return NextResponse.json({
      success: true,
      provider: result.method,
      preference: getActiveSmsProviderPreference(),
      configuredProviders: getConfiguredSmsProviders(),
      result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown SMS test error";
    return NextResponse.json(
      {
        success: false,
        preference: getActiveSmsProviderPreference(),
        configuredProviders: getConfiguredSmsProviders(),
        error: message,
      },
      { status: 500 }
    );
  }
}
