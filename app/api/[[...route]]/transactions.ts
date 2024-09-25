import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { parse, subDays } from "date-fns";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db/drizzle";
import {
  accounts,
  categories,
  insertTransactionSchema,
  transactions,
} from "@/db/schema";

import { canUserSeeTransaction } from "../utils/can-user-see-transaction";
import { IsOrganizationMember } from "../utils/is-organization-member";

const app = new Hono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        orgId: z.string().optional(),
        accountId: z.string().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
      })
    ),
    clerkMiddleware(),
    async (ctx) => {
      const auth = getAuth(ctx);

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized" }, 401);
      }

      const { orgId, accountId, from, to } = ctx.req.valid("query");

      if (orgId && !(await IsOrganizationMember(orgId, auth.userId))) {
        return ctx.json(
          { error: "User does not belong to the organization!" },
          400
        );
      }

      const defaultTo = new Date();
      const defaultFrom = subDays(defaultTo, 30);

      const startDate = from
        ? parse(from, "yyyy-MM-dd", new Date())
        : defaultFrom;

      const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo;

      const data = await db
        .select({
          id: transactions.id,
          amount: transactions.amount,
          payee: transactions.payee,
          description: transactions.description,
          date: transactions.date,
          account: accounts.name,
          accountId: transactions.accountId,
          category: categories.name,
          categoryId: transactions.categoryId,
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
            accountId ? eq(transactions.accountId, accountId) : undefined,
            gte(transactions.date, startDate),
            lte(transactions.date, endDate)
          )
        )
        .orderBy(desc(transactions.date));

      return ctx.json({ data });
    }
  )
  .get(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.string(),
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
        return ctx.json({ error: "Transaction Id is required!" }, 400);
      }

      const { canSeeTransaction, data } = await canUserSeeTransaction(
        id,
        auth.userId
      );

      if (!canSeeTransaction) {
        return ctx.json(
          { error: `Transaction with the id: ${id} not found` },
          404
        );
      }

      return ctx.json({ data });
    }
  )
  .post(
    "/",
    clerkMiddleware(),
    zValidator(
      "json",
      insertTransactionSchema.omit({
        id: true,
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
  )
  .patch(
    "/:id",
    clerkMiddleware(),
    zValidator(
      "param",
      z.object({
        id: z.string(),
      })
    ),
    zValidator(
      "json",
      insertTransactionSchema.omit({
        id: true,
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
        return ctx.json({ error: "Transaction Id is required!" }, 400);
      }

      const values = ctx.req.valid("json");

      const { canSeeTransaction } = await canUserSeeTransaction(
        id,
        auth.userId
      );

      if (!canSeeTransaction) {
        return ctx.json(
          { error: `Transaction with the id: ${id} not found` },
          404
        );
      }

      const [data] = await db
        .update(transactions)
        .set({
          ...values,
          updated_at: new Date(),
          updated_by: auth.userId,
        })
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
        id: z.string(),
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized" }, 401);
      }

      const { id } = ctx.req.valid("param");

      if (!id) {
        return ctx.json({ error: "Transaction Id is required!" }, 400);
      }

      const { canSeeTransaction } = await canUserSeeTransaction(
        id,
        auth.userId
      );

      if (!canSeeTransaction) {
        return ctx.json(
          { error: `Transaction with the id: ${id} not found` },
          404
        );
      }

      const [data] = await db
        .delete(transactions)
        .where(eq(transactions.id, id))
        .returning();

      if (!data) {
        return ctx.json(
          { error: `Transaction with the id: ${id} not found` },
          404
        );
      }

      return ctx.json({ data });
    }
  );

export default app;
