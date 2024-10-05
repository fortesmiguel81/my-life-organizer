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

import { canUserSeeAccount } from "../utils/can-user-see-account";
import { canUserSeeTransaction } from "../utils/can-user-see-transaction";
import { updateAccountBalance } from "../utils/update-account-balance";

const app = new Hono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
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

      const { accountId, from, to } = ctx.req.valid("query");

      const defaultTo = new Date();
      const defaultFrom = subDays(defaultTo, 30);

      const startDate = from
        ? parse(from, "yyyy-MM-dd", new Date())
        : defaultFrom;

      const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo;

      // Construct query conditions
      const queryConditions = [
        auth.orgId
          ? eq(accounts.orgId, auth.orgId)
          : eq(accounts.userId, auth.userId),
      ];

      if (accountId) {
        queryConditions.push(eq(transactions.accountId, accountId));
      }
      if (from) {
        queryConditions.push(gte(transactions.date, startDate));
      }
      if (to) {
        queryConditions.push(lte(transactions.date, endDate));
      }

      const finalConditions = queryConditions.filter(Boolean);

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
          categoryIcon: categories.icon,
          categoryId: transactions.categoryId,
          created_at: transactions.created_at,
          created_by: transactions.created_by,
          updated_at: transactions.updated_at,
          updated_by: transactions.updated_by,
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(and(...finalConditions))
        .orderBy(desc(transactions.date));

      return ctx.json({ data });
    }
  )
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
      try {
        const auth = getAuth(ctx);
        if (!auth?.userId) {
          return ctx.json({ error: "Unauthorized" }, 401);
        }

        const values = ctx.req.valid("json");

        const { data: account, canSeeAccount } = await canUserSeeAccount(
          values.accountId,
          auth.userId
        );

        if (!canSeeAccount || !account) {
          throw new Error(`Account with the id: ${values.accountId} not found`);
        }

        const updatedBalance = account.balance + values.amount;

        const [updatedAccount] = await db
          .update(accounts)
          .set({
            balance: updatedBalance,
            updated_at: new Date(),
            updated_by: auth.userId,
          })
          .where(eq(accounts.id, values.accountId))
          .returning();

        if (!updatedAccount) {
          throw new Error(
            `Failed to update account with the id: ${values.accountId}`
          );
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

        return ctx.json({ data }, 201);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        return ctx.json({ error: errorMessage }, 400);
      }
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
      insertTransactionSchema.omit({
        id: true,
        created_at: true,
        created_by: true,
        updated_at: true,
        updated_by: true,
      })
    ),
    async (ctx) => {
      try {
        const auth = getAuth(ctx);

        if (!auth?.userId) {
          return ctx.json({ error: "Unauthorized" }, 401);
        }

        const { id } = ctx.req.valid("param");
        if (!id) {
          return ctx.json({ error: "Transaction ID is required!" }, 400);
        }

        const values = ctx.req.valid("json");

        const { data: originalTransaction, canSeeTransaction } =
          await canUserSeeTransaction(id, auth.userId);

        if (!canSeeTransaction || !originalTransaction) {
          return ctx.json(
            { error: `Transaction with the Id: ${id} not found` },
            404
          );
        }

        const { data: currentAccount, canSeeAccount: canSeeCurrentAccount } =
          await canUserSeeAccount(originalTransaction.accountId, auth.userId);

        if (!canSeeCurrentAccount || !currentAccount) {
          throw new Error(
            `Account with the Id: ${originalTransaction.accountId} not found`
          );
        }

        const { data: newAccount, canSeeAccount: canSeeNewAccount } =
          await canUserSeeAccount(values.accountId, auth.userId);

        if (!canSeeNewAccount || !newAccount) {
          throw new Error(
            `Account with the Id: ${originalTransaction.accountId} not found`
          );
        }

        if (currentAccount.id !== newAccount.id) {
          const updatedCurrentAccount = await updateAccountBalance(
            currentAccount.id,
            currentAccount.balance,
            Math.abs(originalTransaction.amount),
            auth.userId
          );

          if (!updatedCurrentAccount) {
            throw new Error(
              `Failed to update new account with the Id: ${values.accountId}`
            );
          }

          const updatedNewAccount = await updateAccountBalance(
            newAccount.id,
            newAccount.balance,
            values.amount,
            auth.userId
          );

          if (!updatedNewAccount) {
            throw new Error(
              `Failed to update new account with the Id: ${values.accountId}`
            );
          }
        } else {
          const updatedAccount = await updateAccountBalance(
            currentAccount.id,
            currentAccount.balance,
            originalTransaction.amount,
            auth.userId
          );

          if (!updatedAccount) {
            throw new Error(
              `Failed to update new account with the Id: ${values.accountId}`
            );
          }
        }

        const [data] = await db
          .update(transactions)
          .set({
            ...values,
            updated_at: new Date(),
            updated_by: auth.userId,
          })
          .where(eq(transactions.id, id))
          .returning();

        return ctx.json({ data }, 200);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        return ctx.json({ error: errorMessage }, 400);
      }
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
        return ctx.json({ error: "Transaction Id is required!" }, 400);
      }

      const { data: transaction, canSeeTransaction } =
        await canUserSeeTransaction(id, auth.userId);

      if (!canSeeTransaction || !transaction) {
        return ctx.json(
          { error: `Transaction with the id: ${id} not found` },
          404
        );
      }

      const { data: currentAccount, canSeeAccount: canSeeCurrentAccount } =
        await canUserSeeAccount(transaction.accountId, auth.userId);

      if (!canSeeCurrentAccount || !currentAccount) {
        throw new Error(
          `Account with the Id: ${transaction.accountId} not found`
        );
      }

      const updatedNewAccount = await updateAccountBalance(
        transaction.accountId,
        currentAccount.balance,
        Math.abs(transaction.amount),
        auth.userId
      );

      if (!updatedNewAccount) {
        throw new Error(
          `Failed to update new account with the Id: ${transaction.accountId}`
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
