import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { and, eq, gte, lte } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { events, insertEventSchema } from "@/db/schema";

const app = new Hono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({ from: z.string().optional(), to: z.string().optional() })
    ),
    clerkMiddleware(),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { from, to } = ctx.req.valid("query");

      const conditions: Parameters<typeof and>[0][] = [
        auth.orgId
          ? eq(events.orgId, auth.orgId)
          : eq(events.userId, auth.userId),
      ];
      if (from) conditions.push(gte(events.startDate, new Date(from)));
      if (to) conditions.push(lte(events.endDate, new Date(to)));

      const data = await db
        .select()
        .from(events)
        .where(and(...conditions));

      return ctx.json({ data });
    }
  )
  .get(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    clerkMiddleware(),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { id } = ctx.req.valid("param");

      const [data] = await db
        .select()
        .from(events)
        .where(
          and(
            eq(events.id, id),
            auth.orgId
              ? eq(events.orgId, auth.orgId)
              : eq(events.userId, auth.userId)
          )
        );

      if (!data) return ctx.json({ error: "Event not found" }, 404);

      return ctx.json({ data });
    }
  )
  .post(
    "/",
    clerkMiddleware(),
    zValidator(
      "json",
      insertEventSchema.omit({
        id: true,
        userId: true,
        orgId: true,
        created_at: true,
        created_by: true,
        updated_at: true,
        updated_by: true,
        notified: true,
        googleEventId: true,
        googleCalendarId: true,
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const values = ctx.req.valid("json");
      const now = new Date();

      const [data] = await db
        .insert(events)
        .values({
          id: createId(),
          ...values,
          notified: false,
          userId: auth.orgId ? null : auth.userId,
          orgId: auth.orgId ?? null,
          created_at: now,
          created_by: auth.userId,
          updated_at: now,
          updated_by: auth.userId,
        })
        .returning();

      return ctx.json({ data }, 201);
    }
  )
  .patch(
    "/:id",
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string() })),
    zValidator(
      "json",
      insertEventSchema.omit({
        id: true,
        userId: true,
        orgId: true,
        created_at: true,
        created_by: true,
        updated_at: true,
        updated_by: true,
        notified: true,
        googleEventId: true,
        googleCalendarId: true,
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { id } = ctx.req.valid("param");
      const values = ctx.req.valid("json");

      const [existing] = await db
        .select({ id: events.id })
        .from(events)
        .where(
          and(
            eq(events.id, id),
            auth.orgId
              ? eq(events.orgId, auth.orgId)
              : eq(events.userId, auth.userId)
          )
        );

      if (!existing) return ctx.json({ error: "Event not found" }, 404);

      const [data] = await db
        .update(events)
        .set({
          ...values,
          notified: false,
          updated_at: new Date(),
          updated_by: auth.userId,
        })
        .where(eq(events.id, id))
        .returning();

      return ctx.json({ data });
    }
  )
  .delete(
    "/:id",
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string() })),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { id } = ctx.req.valid("param");

      const [existing] = await db
        .select({ id: events.id })
        .from(events)
        .where(
          and(
            eq(events.id, id),
            auth.orgId
              ? eq(events.orgId, auth.orgId)
              : eq(events.userId, auth.userId)
          )
        );

      if (!existing) return ctx.json({ error: "Event not found" }, 404);

      const [data] = await db
        .delete(events)
        .where(eq(events.id, id))
        .returning();

      return ctx.json({ data });
    }
  );

export default app;
