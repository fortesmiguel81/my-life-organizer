import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { type NextRequest } from "next/server";

import { createId } from "@paralleldrive/cuid2";

import { db } from "@/db/drizzle";
import { googleTokens } from "@/db/schema";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { searchParams, origin } = req.nextUrl;
  const code = searchParams.get("code");

  if (!code) {
    return Response.redirect(`${origin}/calendar?error=no_code`);
  }

  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ??
    `${origin}/api/google-calendar/callback`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenRes.json();

  if (!tokens.access_token) {
    return Response.redirect(`${origin}/calendar?error=token_exchange`);
  }

  const now = new Date();
  const expiresAt = tokens.expires_in
    ? new Date(now.getTime() + tokens.expires_in * 1000)
    : null;

  const [existing] = await db
    .select({ id: googleTokens.id, refreshToken: googleTokens.refreshToken })
    .from(googleTokens)
    .where(eq(googleTokens.userId, userId));

  if (existing) {
    await db
      .update(googleTokens)
      .set({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? existing.refreshToken,
        expiresAt,
        scope: tokens.scope ?? null,
        updated_at: now,
      })
      .where(eq(googleTokens.userId, userId));
  } else {
    await db.insert(googleTokens).values({
      id: createId(),
      userId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? null,
      expiresAt,
      scope: tokens.scope ?? null,
      created_at: now,
      updated_at: now,
    });
  }

  return Response.redirect(`${origin}/calendar?connected=true`);
}
