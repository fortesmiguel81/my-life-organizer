import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { createId } from "@paralleldrive/cuid2";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";

import { db } from "@/db/drizzle";
import { events, googleTokens } from "@/db/schema";

async function getValidAccessToken(
  token: typeof googleTokens.$inferSelect
): Promise<string | null> {
  if (!token.expiresAt || token.expiresAt > new Date()) {
    return token.accessToken;
  }

  if (!token.refreshToken) return null;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: token.refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (!data.access_token) return null;

  const now = new Date();
  await db
    .update(googleTokens)
    .set({
      accessToken: data.access_token,
      expiresAt: data.expires_in
        ? new Date(now.getTime() + data.expires_in * 1000)
        : null,
      updated_at: now,
    })
    .where(eq(googleTokens.userId, token.userId));

  return data.access_token;
}

const app = new Hono()
  .get("/status", clerkMiddleware(), async (ctx) => {
    const auth = getAuth(ctx);
    if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

    const [token] = await db
      .select({ id: googleTokens.id })
      .from(googleTokens)
      .where(eq(googleTokens.userId, auth.userId));

    return ctx.json({ connected: !!token });
  })
  .post("/import", clerkMiddleware(), async (ctx) => {
    const auth = getAuth(ctx);
    if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

    const [token] = await db
      .select()
      .from(googleTokens)
      .where(eq(googleTokens.userId, auth.userId));

    if (!token) {
      return ctx.json({ error: "Google Calendar not connected" }, 400);
    }

    const accessToken = await getValidAccessToken(token);
    if (!accessToken) {
      return ctx.json({ error: "Failed to obtain a valid access token" }, 400);
    }

    const timeMin = new Date();
    timeMin.setMonth(timeMin.getMonth() - 1);
    const timeMax = new Date();
    timeMax.setMonth(timeMax.getMonth() + 3);

    const url = new URL(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events"
    );
    url.searchParams.set("timeMin", timeMin.toISOString());
    url.searchParams.set("timeMax", timeMax.toISOString());
    url.searchParams.set("singleEvents", "true");
    url.searchParams.set("orderBy", "startTime");
    url.searchParams.set("maxResults", "250");

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      return ctx.json({ error: "Failed to fetch Google Calendar events" }, 400);
    }

    const calendarData = await res.json();
    const googleEvents: any[] = calendarData.items ?? [];

    const userFilter = auth.orgId
      ? eq(events.orgId, auth.orgId)
      : eq(events.userId, auth.userId);

    let imported = 0;
    let updated = 0;
    const now = new Date();

    for (const gEvent of googleEvents) {
      if (gEvent.status === "cancelled") continue;

      const allDay = !gEvent.start?.dateTime;
      const startDate = allDay
        ? new Date(gEvent.start?.date ?? "")
        : new Date(gEvent.start.dateTime);
      const endDate = allDay
        ? new Date(gEvent.end?.date ?? "")
        : new Date(gEvent.end.dateTime);

      const [existing] = await db
        .select({ id: events.id })
        .from(events)
        .where(
          and(eq(events.googleEventId, gEvent.id as string), userFilter)
        );

      const payload = {
        title: (gEvent.summary as string | undefined) ?? "Untitled",
        description: (gEvent.description as string | undefined) ?? null,
        startDate,
        endDate,
        allDay,
        location: (gEvent.location as string | undefined) ?? null,
        updated_at: now,
        updated_by: auth.userId,
      };

      if (existing) {
        await db
          .update(events)
          .set(payload)
          .where(eq(events.id, existing.id));
        updated++;
      } else {
        await db.insert(events).values({
          id: createId(),
          ...payload,
          color: null,
          googleEventId: gEvent.id as string,
          googleCalendarId: "primary",
          notifyBefore: 30,
          notified: false,
          userId: auth.orgId ? null : auth.userId,
          orgId: auth.orgId ?? null,
          created_at: now,
          created_by: auth.userId,
        });
        imported++;
      }
    }

    return ctx.json({ imported, updated, total: googleEvents.length });
  });

export default app;
