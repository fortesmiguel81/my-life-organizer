import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { budgets, categories, insertBudgetSchema } from "@/db/schema";

import { canUserSeeBudget } from "../utils/can-user-see-budget";

const app = new Hono()
  .get("/", clerkMiddleware(), async (ctx) => {
    const auth = getAuth(ctx);

    if (!auth?.userId) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const data = await db
      .select({
        id: budgets.id,
        amount: budgets.amount,
        category: categories.name,
        categoryIcon: categories.icon,
        categoryId: budgets.categoryId,
        type: budgets.type,
        userId: budgets.userId,
        orgId: budgets.orgId,
      })
      .from(budgets)
      .innerJoin(categories, eq(budgets.categoryId, categories.id))
      .where(
        and(
          auth?.orgId
            ? eq(budgets.orgId, auth?.orgId)
            : eq(budgets.userId, auth.userId)
        )
      );

    return ctx.json({ data });
  })
  .get(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    clerkMiddleware(),
    async (ctx) => {
      const auth = getAuth(ctx);

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized" }, 401);
      }

      const { id } = ctx.req.valid("param");

      if (!id) {
        return ctx.json({ error: "Budget Id is required!" }, 400);
      }

      const { canSeeBudget, data } = await canUserSeeBudget(id, auth.userId);

      if (!canSeeBudget) {
        return ctx.json({ error: `Budget with the id: ${id} not found` }, 404);
      }

      return ctx.json({ data });
    }
  )
  .post(
    "/",
    clerkMiddleware(),
    zValidator(
      "json",
      insertBudgetSchema.omit({
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
      const values = ctx.req.valid("json");

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized" }, 401);
      }

      const [data] = await db
        .insert(budgets)
        .values({
          id: createId(),
          ...values,
          orgId: auth?.orgId,
          userId: auth?.orgId ? null : auth.userId,
          created_at: new Date(),
          created_by: auth.userId,
          updated_at: new Date(),
          updated_by: auth.userId,
        })
        .returning();

      return ctx.json({ data });
    }
  )
  .patch(
    "/:id",
    clerkMiddleware(),
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    zValidator(
      "json",
      insertBudgetSchema.omit({
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

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized" }, 401);
      }

      const { id } = ctx.req.valid("param");

      if (!id) {
        return ctx.json({ error: "Category Id is required!" }, 400);
      }

      const values = ctx.req.valid("json");

      const { canSeeBudget } = await canUserSeeBudget(id, auth.userId);

      if (!canSeeBudget) {
        return ctx.json({ error: `Budget with the id: ${id} not found` }, 404);
      }

      const [data] = await db
        .update(budgets)
        .set({
          ...values,
          updated_at: new Date(),
          updated_by: auth.userId,
        })
        .where(eq(budgets.id, id))
        .returning();

      return ctx.json({ data });
    }
  )
  .delete(
    "/:id",
    clerkMiddleware(),
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized" }, 401);
      }

      const { id } = ctx.req.valid("param");

      if (!id) {
        return ctx.json({ error: "Budget Id is required!" }, 400);
      }

      const { canSeeBudget } = await canUserSeeBudget(id, auth.userId);

      if (!canSeeBudget) {
        return ctx.json({ error: `Budget with the id: ${id} not found` }, 404);
      }

      const [data] = await db
        .delete(budgets)
        .where(eq(budgets.id, id))
        .returning();

      if (!data) {
        return ctx.json({ error: `Budget with the id: ${id} not found` }, 404);
      }

      return ctx.json({ data });
    }
  );

export default app;
