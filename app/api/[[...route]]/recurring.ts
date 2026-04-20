import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { createId } from "@paralleldrive/cuid2";
import { and, eq, lte, ne } from "drizzle-orm";
import { Hono } from "hono";

import { db } from "@/db/drizzle";
import { accounts, transactions } from "@/db/schema";

import { getNextDueDate } from "./transactions";
import { updateAccountBalance } from "../utils/update-account-balance";

const app = new Hono().post(
  "/process",
  clerkMiddleware(),
  async (ctx) => {
    const auth = getAuth(ctx);

    if (!auth?.userId) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const now = new Date();

    const due = await db
      .select({
        transaction: transactions,
        account: accounts,
      })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(
        and(
          auth.orgId
            ? eq(accounts.orgId, auth.orgId)
            : eq(accounts.userId, auth.userId),
          ne(transactions.recurrence, "none"),
          lte(transactions.nextDueDate, now)
        )
      );

    const created: string[] = [];

    for (const { transaction: tpl, account } of due) {
      // Create a one-off instance of the recurring transaction
      await db.insert(transactions).values({
        id: createId(),
        amount: tpl.amount,
        payee: tpl.payee,
        description: tpl.description,
        date: now,
        accountId: tpl.accountId,
        categoryId: tpl.categoryId,
        type: tpl.type,
        recurrence: "none",
        nextDueDate: null,
        linkedTransactionId: null,
        created_at: now,
        created_by: auth.userId,
        updated_at: now,
        updated_by: auth.userId,
      });

      await updateAccountBalance(
        tpl.accountId,
        account.balance,
        tpl.amount,
        auth.userId
      );

      // Advance the template's nextDueDate
      const next = getNextDueDate(tpl.nextDueDate!, tpl.recurrence) ?? null;
      await db
        .update(transactions)
        .set({ nextDueDate: next, updated_at: now, updated_by: auth.userId })
        .where(eq(transactions.id, tpl.id));

      created.push(tpl.id);
    }

    return ctx.json({ processed: created.length });
  }
);

export default app;
