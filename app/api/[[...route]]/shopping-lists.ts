import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { and, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db/drizzle";
import {
  insertShoppingListSchema,
  shoppingItems,
  shoppingLists,
} from "@/db/schema";
import { getAuth } from "@/lib/local-auth";

const app = new Hono()
  .get("/", async (ctx) => {
    const auth = getAuth(ctx);
    if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

    const userFilter = eq(shoppingLists.userId, auth.userId);

    const data = await db
      .select({
        id: shoppingLists.id,
        name: shoppingLists.name,
        icon: shoppingLists.icon,
        itemCount: sql<number>`cast(count(${shoppingItems.id}) as int)`,
        checkedCount: sql<number>`cast(sum(case when ${shoppingItems.checked} then 1 else 0 end) as int)`,
        estimatedTotal: sql<number>`cast(coalesce(sum(${shoppingItems.estimatedPrice}), 0) as int)`,
      })
      .from(shoppingLists)
      .leftJoin(shoppingItems, eq(shoppingItems.listId, shoppingLists.id))
      .where(userFilter)
      .groupBy(shoppingLists.id);

    return ctx.json({ data });
  })
  .post(
    "/",
    zValidator(
      "json",
      insertShoppingListSchema.omit({
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
        .insert(shoppingLists)
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
  .patch(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    zValidator(
      "json",
      insertShoppingListSchema
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
      const userFilter = eq(shoppingLists.userId, auth.userId);

      const [data] = await db
        .update(shoppingLists)
        .set({ ...values, updated_at: new Date(), updated_by: auth.userId })
        .where(and(eq(shoppingLists.id, id), userFilter))
        .returning();

      if (!data) return ctx.json({ error: "List not found" }, 404);
      return ctx.json({ data });
    }
  )
  .delete(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { id } = ctx.req.valid("param");
      const userFilter = eq(shoppingLists.userId, auth.userId);

      const [data] = await db
        .delete(shoppingLists)
        .where(and(eq(shoppingLists.id, id), userFilter))
        .returning();

      if (!data) return ctx.json({ error: "List not found" }, 404);
      return ctx.json({ data });
    }
  );

export default app;
