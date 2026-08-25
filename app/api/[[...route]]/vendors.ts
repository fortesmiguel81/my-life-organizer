import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { insertVendorSchema, vendorQuotes, vendors } from "@/db/schema";
import { getAuth } from "@/lib/local-auth";

const app = new Hono()
  // GET /api/vendors — list
  .get("/", async (ctx) => {
    const auth = getAuth(ctx);
    if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

    const data = await db
      .select()
      .from(vendors)
      .where(eq(vendors.userId, auth.userId))
      .orderBy(vendors.name);

    return ctx.json({ data });
  })

  // GET /api/vendors/:id — single vendor with its quotes
  .get(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { id } = ctx.req.valid("param");
      const userFilter = eq(vendors.userId, auth.userId);

      const [vendor] = await db
        .select()
        .from(vendors)
        .where(and(eq(vendors.id, id), userFilter));

      if (!vendor) return ctx.json({ error: "Vendor not found" }, 404);

      const quotes = await db
        .select()
        .from(vendorQuotes)
        .where(eq(vendorQuotes.vendorId, id))
        .orderBy(desc(vendorQuotes.quoteDate), desc(vendorQuotes.created_at));

      return ctx.json({ data: { ...vendor, quotes } });
    }
  )

  // POST /api/vendors — create
  .post(
    "/",
    zValidator(
      "json",
      insertVendorSchema.omit({
        id: true,
        userId: true,
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
        .insert(vendors)
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

  // PATCH /api/vendors/:id — update
  .patch(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    zValidator(
      "json",
      insertVendorSchema
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
      const userFilter = eq(vendors.userId, auth.userId);

      const [existing] = await db
        .select({ id: vendors.id })
        .from(vendors)
        .where(and(eq(vendors.id, id), userFilter));

      if (!existing) return ctx.json({ error: "Vendor not found" }, 404);

      const [data] = await db
        .update(vendors)
        .set({ ...values, updated_at: new Date(), updated_by: auth.userId })
        .where(eq(vendors.id, id))
        .returning();

      return ctx.json({ data });
    }
  )

  // DELETE /api/vendors/:id — delete (quotes cascade)
  .delete(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { id } = ctx.req.valid("param");
      const userFilter = eq(vendors.userId, auth.userId);

      const [existing] = await db
        .select({ id: vendors.id })
        .from(vendors)
        .where(and(eq(vendors.id, id), userFilter));

      if (!existing) return ctx.json({ error: "Vendor not found" }, 404);

      const [data] = await db
        .delete(vendors)
        .where(eq(vendors.id, id))
        .returning();

      return ctx.json({ data });
    }
  );

export default app;
