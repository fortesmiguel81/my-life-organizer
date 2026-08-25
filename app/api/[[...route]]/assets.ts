import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { assets, insertAssetSchema } from "@/db/schema";
import { getAuth } from "@/lib/local-auth";

const app = new Hono()
  // GET /api/assets — list
  .get("/", async (ctx) => {
    const auth = getAuth(ctx);
    if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

    const data = await db
      .select()
      .from(assets)
      .where(eq(assets.userId, auth.userId))
      .orderBy(assets.name);

    return ctx.json({ data });
  })

  // GET /api/assets/:id — single asset
  .get(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { id } = ctx.req.valid("param");

      const [data] = await db
        .select()
        .from(assets)
        .where(and(eq(assets.id, id), eq(assets.userId, auth.userId)));

      if (!data) return ctx.json({ error: "Asset not found" }, 404);

      return ctx.json({ data });
    }
  )

  // POST /api/assets — create
  .post(
    "/",
    zValidator(
      "json",
      insertAssetSchema.omit({
        id: true,
        userId: true,
        warrantyExpiryNotified: true,
        created_at: true,
        created_by: true,
        updated_at: true,
        updated_by: true,
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const values = ctx.req.valid("json");
      const now = new Date();

      const [data] = await db
        .insert(assets)
        .values({
          id: createId(),
          ...values,
          userId: auth.userId,
          created_at: now,
          created_by: auth.userId,
          updated_at: now,
          updated_by: auth.userId,
        })
        .returning();

      return ctx.json({ data }, 201);
    }
  )

  // PATCH /api/assets/:id — update
  .patch(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    zValidator(
      "json",
      insertAssetSchema
        .omit({
          id: true,
          userId: true,
          created_at: true,
          created_by: true,
          updated_at: true,
          updated_by: true,
        })
        .partial()
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { id } = ctx.req.valid("param");
      const values = ctx.req.valid("json");
      const userFilter = eq(assets.userId, auth.userId);

      const [existing] = await db
        .select({ id: assets.id })
        .from(assets)
        .where(and(eq(assets.id, id), userFilter));

      if (!existing) return ctx.json({ error: "Asset not found" }, 404);

      // Any warranty date edit resets the notification flag so a pushed-out
      // date is re-evaluated for the 30-day reminder window.
      const resetNotified = "warrantyExpiration" in values;

      const [data] = await db
        .update(assets)
        .set({
          ...values,
          ...(resetNotified ? { warrantyExpiryNotified: false } : {}),
          updated_at: new Date(),
          updated_by: auth.userId,
        })
        .where(eq(assets.id, id))
        .returning();

      return ctx.json({ data });
    }
  )

  // DELETE /api/assets/:id — delete
  .delete(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { id } = ctx.req.valid("param");
      const userFilter = eq(assets.userId, auth.userId);

      const [existing] = await db
        .select({ id: assets.id })
        .from(assets)
        .where(and(eq(assets.id, id), userFilter));

      if (!existing) return ctx.json({ error: "Asset not found" }, 404);

      const [data] = await db
        .delete(assets)
        .where(eq(assets.id, id))
        .returning();

      return ctx.json({ data });
    }
  );

export default app;
