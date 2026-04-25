import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { and, asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { insertShoppingItemSchema, shoppingItems, shoppingLists } from "@/db/schema";

const app = new Hono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        listId: z.string().optional(),
        checked: z.enum(["true", "false"]).optional(),
      })
    ),
    clerkMiddleware(),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { listId, checked } = ctx.req.valid("query");
      const userFilter = auth.orgId
        ? eq(shoppingLists.orgId, auth.orgId)
        : eq(shoppingLists.userId, auth.userId);

      const conditions: Parameters<typeof and>[0][] = [userFilter];
      if (listId) conditions.push(eq(shoppingItems.listId, listId));
      if (checked !== undefined) conditions.push(eq(shoppingItems.checked, checked === "true"));

      const data = await db
        .select({
          id: shoppingItems.id,
          listId: shoppingItems.listId,
          name: shoppingItems.name,
          quantity: shoppingItems.quantity,
          unit: shoppingItems.unit,
          category: shoppingItems.category,
          checked: shoppingItems.checked,
          estimatedPrice: shoppingItems.estimatedPrice,
          note: shoppingItems.note,
          addedBy: shoppingItems.addedBy,
          created_at: shoppingItems.created_at,
          updated_at: shoppingItems.updated_at,
        })
        .from(shoppingItems)
        .innerJoin(shoppingLists, eq(shoppingItems.listId, shoppingLists.id))
        .where(and(...conditions))
        .orderBy(asc(shoppingItems.category), asc(shoppingItems.created_at));

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
      const userFilter = auth.orgId
        ? eq(shoppingLists.orgId, auth.orgId)
        : eq(shoppingLists.userId, auth.userId);

      const [row] = await db
        .select({ shoppingItems })
        .from(shoppingItems)
        .innerJoin(shoppingLists, eq(shoppingItems.listId, shoppingLists.id))
        .where(and(eq(shoppingItems.id, id), userFilter));

      if (!row) return ctx.json({ error: "Item not found" }, 404);
      return ctx.json({ data: row.shoppingItems });
    }
  )
  .post(
    "/",
    clerkMiddleware(),
    zValidator(
      "json",
      insertShoppingItemSchema.omit({
        id: true,
        userId: true,
        orgId: true,
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
        .insert(shoppingItems)
        .values({
          id: createId(),
          ...values,
          addedBy: auth.userId,
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
      insertShoppingItemSchema
        .omit({
          id: true,
          userId: true,
          orgId: true,
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
      const userFilter = auth.orgId
        ? eq(shoppingLists.orgId, auth.orgId)
        : eq(shoppingLists.userId, auth.userId);

      const [existing] = await db
        .select({ id: shoppingItems.id })
        .from(shoppingItems)
        .innerJoin(shoppingLists, eq(shoppingItems.listId, shoppingLists.id))
        .where(and(eq(shoppingItems.id, id), userFilter));

      if (!existing) return ctx.json({ error: "Item not found" }, 404);

      const [data] = await db
        .update(shoppingItems)
        .set({ ...values, updated_at: new Date(), updated_by: auth.userId })
        .where(eq(shoppingItems.id, id))
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
      const userFilter = auth.orgId
        ? eq(shoppingLists.orgId, auth.orgId)
        : eq(shoppingLists.userId, auth.userId);

      const [existing] = await db
        .select({ id: shoppingItems.id })
        .from(shoppingItems)
        .innerJoin(shoppingLists, eq(shoppingItems.listId, shoppingLists.id))
        .where(and(eq(shoppingItems.id, id), userFilter));

      if (!existing) return ctx.json({ error: "Item not found" }, 404);

      const [data] = await db
        .delete(shoppingItems)
        .where(eq(shoppingItems.id, id))
        .returning();

      return ctx.json({ data });
    }
  );

export default app;
