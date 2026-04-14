import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { checkSessionCookie } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || "bluejay2026").trim();

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { allowed } = rateLimit(`login:${ip}`, 10, 5 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many login attempts. Try again in 5 minutes." }, { status: 429 });
  }

  const body = await request.json();
  const { password } = body;

  if (password === ADMIN_PASSWORD) {
    const sessionToken = createHash("sha256").update(ADMIN_PASSWORD + "bluejays-session-salt").digest("hex");
    const response = NextResponse.json({ success: true });
    response.cookies.set("bluejays_auth", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    return response;
  }

  return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}
