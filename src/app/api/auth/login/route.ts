import { NextRequest, NextResponse } from "next/server";
import { checkSessionCookie } from "@/lib/auth";

const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || "bluejay2026").trim();

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password } = body;

  if (password === ADMIN_PASSWORD) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("bluejays_auth", ADMIN_PASSWORD, {
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
