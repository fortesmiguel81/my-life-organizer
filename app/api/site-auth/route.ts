import { NextRequest, NextResponse } from "next/server";

import { SITE_AUTH_COOKIE, computeSiteToken } from "@/lib/site-auth";

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const expected = process.env.APP_PASSWORD;

  if (!expected || typeof password !== "string" || password !== expected) {
    // Small fixed delay to blunt naive brute forcing.
    await new Promise((resolve) => setTimeout(resolve, 500));
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const token = await computeSiteToken(expected);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SITE_AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR,
  });

  return res;
}
