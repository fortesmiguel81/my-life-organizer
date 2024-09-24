import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db/drizzle";
import {
  accounts,
  categories,
  insertTransactionSchema,
  transactions,
} from "@/db/schema";

import { IsOrganizationMember } from "../utils/is-organization-member";

const app = new Hono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        orgId: z.string().optional(),
        accountId: z.string().optional(),
      })
    ),
    clerkMiddleware(),
    async (ctx) => {
      const auth = getAuth(ctx);

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized" }, 401);
      }

      const { orgId, accountId } = ctx.req.valid("query");

      if (orgId && !(await IsOrganizationMember(orgId, auth.userId))) {
        return ctx.json(
          { error: "User does not belong to the organization!" },
          400
        );
      }

      const data = await db
        .select({
          id: transactions.id,
          amount: transactions.amount,
          payee: transactions.payee,
          description: transactions.description,
          date: transactions.date,
          account: accounts.name,
          accountId: transactions.accountId,
          categoryId: transactions.categoryId,
          category: categories.name,
          created_at: transactions.created_at,
          created_by: transactions.created_by,
          updated_at: transactions.updated_at,
          updated_by: transactions.updated_by,
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(
          and(
            orgId
              ? eq(accounts.orgId, orgId)
              : eq(accounts.userId, auth.userId),
            accountId ? eq(transactions.accountId, accountId) : undefined
          )
        )
        .orderBy(desc(transactions.date));

      return ctx.json({ data });
    }
  )
  .post(
    "/",
    clerkMiddleware(),
    zValidator(
      "json",
      insertTransactionSchema.pick({
        date: true,
        amount: true,
        payee: true,
        description: true,
        accountId: true,
        categoryId: true,
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      const values = ctx.req.valid("json");

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized" }, 401);
      }

      const [data] = await db
        .insert(transactions)
        .values({
          id: createId(),
          ...values,
          created_at: new Date(),
          created_by: auth.userId,
          updated_at: new Date(),
          updated_by: auth.userId,
        })
        .returning();

      return ctx.json({ data });
    }
  );

export default app;
