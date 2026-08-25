import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { insertProfileSchema, profiles } from "@/db/schema";
import { PROFILE_COOKIE, getAuth } from "@/lib/local-auth";

const ONE_YEAR = 60 * 60 * 24 * 365;

const app = new Hono()
  .get("/", async (ctx) => {
    const data = await db.select().from(profiles).orderBy(profiles.created_at);
    return ctx.json({ data });
  })
  .get("/me", async (ctx) => {
    const auth = getAuth(ctx);
    if (!auth?.userId) return ctx.json({ data: null });

    const [data] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, auth.userId));
    return ctx.json({ data: data ?? null });
  })
  .post(
    "/",
    zValidator(
      "json",
      insertProfileSchema.omit({ id: true, created_at: true })
    ),
    async (ctx) => {
      const values = ctx.req.valid("json");

      const [data] = await db
        .insert(profiles)
        .values({ id: createId(), ...values, created_at: new Date() })
        .returning();

      return ctx.json({ data }, 201);
    }
  )
  .patch(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    zValidator(
      "json",
      insertProfileSchema.omit({ id: true, created_at: true }).partial()
    ),
    async (ctx) => {
      const { id } = ctx.req.valid("param");
      const values = ctx.req.valid("json");

      const [data] = await db
        .update(profiles)
        .set(values)
        .where(eq(profiles.id, id))
        .returning();

      if (!data) return ctx.json({ error: "Profile not found" }, 404);
      return ctx.json({ data });
    }
  )
  .delete(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    async (ctx) => {
      const { id } = ctx.req.valid("param");

      const [data] = await db
        .delete(profiles)
        .where(eq(profiles.id, id))
        .returning();

      if (!data) return ctx.json({ error: "Profile not found" }, 404);
      return ctx.json({ data });
    }
  )
  .post(
    "/:id/switch",
    zValidator("param", z.object({ id: z.string() })),
    async (ctx) => {
      const { id } = ctx.req.valid("param");

      const [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, id));
      if (!profile) return ctx.json({ error: "Profile not found" }, 404);

      setCookie(ctx, PROFILE_COOKIE, id, {
        httpOnly: true,
        sameSite: "Lax",
        path: "/",
        maxAge: ONE_YEAR,
      });

      return ctx.json({ data: profile });
    }
  );

export default app;
