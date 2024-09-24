import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

import { db } from "@/db/drizzle";
import { accounts, insertTransactionSchema, transactions } from "@/db/schema";

import { IsOrganizationMember } from "../utils/is-organization-member";

const app = new Hono()
  .get("/", clerkMiddleware(), async (ctx) => {
    const auth = getAuth(ctx);

    if (!auth?.userId) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const orgId = ctx.req.query("orgId");

    let whereCondition;

    if (orgId) {
      const isMember = await IsOrganizationMember(orgId, auth.userId);

      whereCondition = eq(accounts.orgId, orgId);

      if (!isMember) {
        return ctx.json(
          { error: "User does not belong to the organization!" },
          400
        );
      }
    } else {
      whereCondition = eq(accounts.userId, auth.userId);
    }

    const data = await db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        payee: transactions.payee,
        description: transactions.description,
        date: transactions.date,
        created_at: transactions.created_at,
        created_by: transactions.created_by,
        updated_at: transactions.updated_at,
        updated_by: transactions.updated_by,
        accountId: transactions.accountId,
      })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(whereCondition);

    return ctx.json({ data });
  })
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
