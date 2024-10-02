import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { and, eq, lt, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db/drizzle";
import {
  accounts,
  budgets,
  categories,
  insertBudgetSchema,
  transactions,
} from "@/db/schema";

import { canUserSeeBudget } from "../utils/can-user-see-budget";

const app = new Hono()
  .get("/", clerkMiddleware(), async (ctx) => {
    const auth = getAuth(ctx);

    if (!auth?.userId) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    // Retrieve budgets and their associated categories
    const budgetsData = await db
      .select({
        id: budgets.id,
        amount: budgets.amount,
        type: budgets.type, // Monthly or Yearly
        userId: budgets.userId,
        orgId: budgets.orgId,
        categoryId: budgets.categoryId,
        category: categories.name,
        categoryDescription: categories.description,
        categoryIcon: categories.icon,
      })
      .from(budgets)
      .innerJoin(categories, eq(budgets.categoryId, categories.id))
      .where(
        and(
          auth.orgId
            ? eq(budgets.orgId, auth.orgId)
            : eq(budgets.userId, auth.userId)
        )
      );

    // Aggregate data for each budget
    const aggregatedData = await Promise.all(
      budgetsData.map(async (budget) => {
        const dateFilter =
          budget.type === "monthly"
            ? sql`date_trunc('month', transactions.date) = date_trunc('month', CURRENT_DATE)`
            : sql`date_trunc('year', transactions.date) = date_trunc('year', CURRENT_DATE)`;

        const result = await db
          .select({
            budgetId: budgets.id,
            amount: sql`SUM(transactions.amount)`.mapWith(Number),
            numberOfTransactions: sql`COUNT(transactions.id)`.mapWith(Number),
          })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .innerJoin(budgets, eq(transactions.categoryId, budgets.categoryId))
          .where(
            and(
              auth.orgId
                ? eq(accounts.orgId, auth.orgId)
                : eq(accounts.userId, auth.userId),
              eq(budgets.id, budget.id),
              lt(transactions.amount, 0),
              dateFilter
            )
          )
          .groupBy(budgets.id, budgets.amount);

        // Return the aggregated data for the current budget
        return (
          result[0] || {
            budgetId: budget.id,
            amount: 0,
            numberOfTransactions: 0,
          }
        );
      })
    );

    // Merge aggregated data with budgets
    const mergedData = budgetsData.map((budget) => {
      const aggregatedInfo = aggregatedData.find(
        (agg) => agg.budgetId === budget.id
      ) || {
        budgetId: "",
        amount: 0,
        numberOfTransactions: 0,
      };
      return {
        ...budget,
        numberOfTransactions: aggregatedInfo.numberOfTransactions || 0,
        amountSpent: Math.abs(aggregatedInfo.amount) || 0,
      };
    });

    return ctx.json({ data: mergedData });
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
