import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/client-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  const cookie = clearSessionCookie();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}
