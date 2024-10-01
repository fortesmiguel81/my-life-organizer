import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { sql } from "drizzle-orm/sql";
// For custom SQL operations
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { accounts, categories, transactions } from "@/db/schema";

const app = new Hono();

app.get(
  "/budget",
  zValidator(
    "query",
    z.object({
      period: z.enum(["monthly", "yearly"]),
      categoryId: z.string(),
    })
  ),
  clerkMiddleware(),
  async (ctx) => {
    const auth = getAuth(ctx);

    if (!auth?.userId) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const { period, categoryId } = ctx.req.valid("query");

    // Validate inputs
    if (!period || !["monthly", "yearly"].includes(period)) {
      return ctx.json({ error: "Invalid period parameter" }, 400);
    }
    if (!categoryId) {
      return ctx.json({ error: "Category ID is required" }, 400);
    }

    // Define the date range filter based on the period
    const dateFilter =
      period === "monthly"
        ? sql`date_trunc('month', transactions.date) = date_trunc('month', CURRENT_DATE)`
        : sql`date_trunc('year', transactions.date) = date_trunc('year', CURRENT_DATE)`;

    // Construct the query to get the sum of transaction amounts and count of transactions for the given category and period
    const data = await db
      .select({
        categoryId: transactions.categoryId,
        amount: sql`SUM(transactions.amount)`, // Sum of transaction amounts
        numberOfTransactions: sql`COUNT(transactions.id)`, // Count of transactions
      })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id)) // Join transactions with accounts to access orgId and userId
      .innerJoin(categories, eq(transactions.categoryId, categories.id)) // Join transactions with categories to filter by category
      .where(
        and(
          eq(transactions.categoryId, categoryId),
          dateFilter, // Filter by the given period (monthly/yearly)
          auth?.orgId
            ? eq(accounts.orgId, auth.orgId)
            : eq(accounts.userId, auth.userId) // Filter by orgId or userId from the accounts table
        )
      )
      .groupBy(transactions.categoryId) // Group by categoryId to get aggregated data
      .execute(); // Execute the query

    // Return the data in the specified format
    return ctx.json({ data });
  }
);

// Start your Hono server
export default app;
