import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { insertVendorQuoteSchema, vendorQuotes, vendors } from "@/db/schema";
import { getAuth } from "@/lib/local-auth";

const app = new Hono()
  // POST /api/vendor-quotes — create (vendorId included in body)
  .post(
    "/",
    zValidator(
      "json",
      insertVendorQuoteSchema.omit({
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

      const [vendor] = await db
        .select({ id: vendors.id })
        .from(vendors)
        .where(
          and(eq(vendors.id, values.vendorId), eq(vendors.userId, auth.userId))
        );

      if (!vendor) return ctx.json({ error: "Vendor not found" }, 404);

      const now = new Date();

      const [data] = await db
        .insert(vendorQuotes)
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

  // PATCH /api/vendor-quotes/:id — update
  .patch(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    zValidator(
      "json",
      insertVendorQuoteSchema
        .omit({
          id: true,
          vendorId: true,
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
      const userFilter = eq(vendorQuotes.userId, auth.userId);

      const [existing] = await db
        .select({ id: vendorQuotes.id })
        .from(vendorQuotes)
        .where(and(eq(vendorQuotes.id, id), userFilter));

      if (!existing) return ctx.json({ error: "Quote not found" }, 404);

      const [data] = await db
        .update(vendorQuotes)
        .set({ ...values, updated_at: new Date(), updated_by: auth.userId })
        .where(eq(vendorQuotes.id, id))
        .returning();

      return ctx.json({ data });
    }
  )

  // DELETE /api/vendor-quotes/:id — delete
  .delete(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { id } = ctx.req.valid("param");
      const userFilter = eq(vendorQuotes.userId, auth.userId);

      const [existing] = await db
        .select({ id: vendorQuotes.id })
        .from(vendorQuotes)
        .where(and(eq(vendorQuotes.id, id), userFilter));

      if (!existing) return ctx.json({ error: "Quote not found" }, 404);

      const [data] = await db
        .delete(vendorQuotes)
        .where(eq(vendorQuotes.id, id))
        .returning();

      return ctx.json({ data });
    }
  );

export default app;
