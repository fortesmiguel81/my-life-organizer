import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  parse,
  subDays,
} from "date-fns";
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
import { decryptFields, encryptFields } from "@/lib/encryption";

import { canUserSeeAccount } from "../utils/can-user-see-account";
import { canUserSeeTransaction } from "../utils/can-user-see-transaction";
import { updateAccountBalance } from "../utils/update-account-balance";

async function decryptTransaction<T extends { payee: string; description: string | null }>(
  row: T
): Promise<T> {
  const decrypted = await decryptFields({ payee: row.payee, description: row.description ?? "" });
  return { ...row, payee: decrypted.payee ?? row.payee, description: decrypted.description };
}

export function getNextDueDate(
  from: Date,
  recurrence: string
): Date | undefined {
  switch (recurrence) {
    case "daily":
      return addDays(from, 1);
    case "weekly":
      return addWeeks(from, 1);
    case "biweekly":
      return addWeeks(from, 2);
    case "monthly":
      return addMonths(from, 1);
    case "yearly":
      return addYears(from, 1);
    default:
      return undefined;
  }
}

const createSchema = insertTransactionSchema
  .omit({
    id: true,
    created_at: true,
    created_by: true,
    updated_at: true,
    updated_by: true,
    linkedTransactionId: true,
  })
  .extend({
    toAccountId: z.string().optional(),
  });

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
          type: transactions.type,
          recurrence: transactions.recurrence,
          nextDueDate: transactions.nextDueDate,
          linkedTransactionId: transactions.linkedTransactionId,
          created_at: transactions.created_at,
          created_by: transactions.created_by,
          updated_at: transactions.updated_at,
          updated_by: transactions.updated_by,
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(and(...queryConditions))
        .orderBy(desc(transactions.date));

      const decrypted = await Promise.all(data.map(decryptTransaction));

      return ctx.json({ data: decrypted });
    }
  )
  .get(
    "/:id",
    zValidator("param", z.object({ id: z.string().optional() })),
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

      if (!canSeeTransaction || !data) {
        return ctx.json(
          { error: `Transaction with the id: ${id} not found` },
          404
        );
      }

      const decrypted = await decryptTransaction(data);

      return ctx.json({ data: decrypted });
    }
  )
  .post(
    "/",
    clerkMiddleware(),
    zValidator("json", createSchema),
    async (ctx) => {
      try {
        const auth = getAuth(ctx);
        if (!auth?.userId) {
          return ctx.json({ error: "Unauthorized" }, 401);
        }

        const { toAccountId, ...values } = ctx.req.valid("json");

        const { data: account, canSeeAccount } = await canUserSeeAccount(
          values.accountId,
          auth.userId
        );

        if (!canSeeAccount || !account) {
          return ctx.json(
            { error: `Account with the id: ${values.accountId} not found` },
            404
          );
        }

        // --- Transfer: create two linked transactions ---
        if (values.type === "transfer" && toAccountId) {
          const { data: toAccount, canSeeAccount: canSeeToAccount } =
            await canUserSeeAccount(toAccountId, auth.userId);

          if (!canSeeToAccount || !toAccount) {
            return ctx.json(
              { error: `Destination account ${toAccountId} not found` },
              404
            );
          }

          const transferAmount = Math.abs(values.amount);
          const sourceId = createId();
          const destId = createId();
          const now = new Date();
          const encryptedTransfer = await encryptFields({ payee: values.payee, description: values.description ?? "" });
          const encPayee = encryptedTransfer.payee ?? values.payee;
          const encDesc = encryptedTransfer.description ?? values.description ?? "";

          const [source] = await db
            .insert(transactions)
            .values({
              id: sourceId,
              ...values,
              payee: encPayee,
              description: encDesc,
              amount: -transferAmount,
              type: "transfer",
              recurrence: "none",
              nextDueDate: null,
              linkedTransactionId: destId,
              categoryId: null,
              created_at: now,
              created_by: auth.userId,
              updated_at: now,
              updated_by: auth.userId,
            })
            .returning();

          await db.insert(transactions).values({
            id: destId,
            ...values,
            payee: encPayee,
            description: encDesc,
            accountId: toAccountId,
            amount: transferAmount,
            type: "transfer",
            recurrence: "none",
            nextDueDate: null,
            linkedTransactionId: sourceId,
            categoryId: null,
            created_at: now,
            created_by: auth.userId,
            updated_at: now,
            updated_by: auth.userId,
          });

          await db
            .update(accounts)
            .set({
              balance: account.balance - transferAmount,
              updated_at: now,
              updated_by: auth.userId,
            })
            .where(eq(accounts.id, account.id));

          await db
            .update(accounts)
            .set({
              balance: toAccount.balance + transferAmount,
              updated_at: now,
              updated_by: auth.userId,
            })
            .where(eq(accounts.id, toAccount.id));

          return ctx.json({ data: source }, 201);
        }

        // --- Regular income / expense ---
        const nextDueDate =
          values.recurrence && values.recurrence !== "none"
            ? (getNextDueDate(values.date, values.recurrence) ?? null)
            : null;

        const encrypted = await encryptFields({ payee: values.payee, description: values.description ?? "" });

        const [data] = await db
          .insert(transactions)
          .values({
            id: createId(),
            ...values,
            payee: encrypted.payee ?? values.payee,
            description: encrypted.description ?? values.description ?? "",
            nextDueDate,
            linkedTransactionId: null,
            created_at: new Date(),
            created_by: auth.userId,
            updated_at: new Date(),
            updated_by: auth.userId,
          })
          .returning();

        await db
          .update(accounts)
          .set({
            balance: account.balance + values.amount,
            updated_at: new Date(),
            updated_by: auth.userId,
          })
          .where(eq(accounts.id, values.accountId));

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
    zValidator("param", z.object({ id: z.string().optional() })),
    zValidator(
      "json",
      insertTransactionSchema.omit({
        id: true,
        created_at: true,
        created_by: true,
        updated_at: true,
        updated_by: true,
        linkedTransactionId: true,
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

        const { data: original, canSeeTransaction } =
          await canUserSeeTransaction(id, auth.userId);

        if (!canSeeTransaction || !original) {
          return ctx.json(
            { error: `Transaction with the Id: ${id} not found` },
            404
          );
        }

        const { data: currentAccount, canSeeAccount: canSeeCurrent } =
          await canUserSeeAccount(original.accountId, auth.userId);

        if (!canSeeCurrent || !currentAccount) {
          return ctx.json(
            { error: `Account with the Id: ${original.accountId} not found` },
            404
          );
        }

        const { data: newAccount, canSeeAccount: canSeeNew } =
          await canUserSeeAccount(values.accountId, auth.userId);

        if (!canSeeNew || !newAccount) {
          return ctx.json(
            { error: `Account with the Id: ${values.accountId} not found` },
            404
          );
        }

        if (currentAccount.id !== newAccount.id) {
          // Reverse original amount from current account, apply new amount to new account
          await updateAccountBalance(
            currentAccount.id,
            currentAccount.balance,
            -original.amount,
            auth.userId
          );
          await updateAccountBalance(
            newAccount.id,
            newAccount.balance,
            values.amount,
            auth.userId
          );
        } else {
          // Same account: reverse original then apply new amount
          const reversedBalance = currentAccount.balance - original.amount;
          await updateAccountBalance(
            currentAccount.id,
            reversedBalance,
            values.amount,
            auth.userId
          );
        }

        const nextDueDate =
          values.recurrence && values.recurrence !== "none"
            ? (getNextDueDate(values.date, values.recurrence) ?? null)
            : null;

        const encryptedPatch = await encryptFields({ payee: values.payee, description: values.description ?? "" });

        const [data] = await db
          .update(transactions)
          .set({
            ...values,
            payee: encryptedPatch.payee ?? values.payee,
            description: encryptedPatch.description ?? values.description ?? "",
            nextDueDate,
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
    zValidator("param", z.object({ id: z.string().optional() })),
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

      const { data: account, canSeeAccount } = await canUserSeeAccount(
        transaction.accountId,
        auth.userId
      );

      if (!canSeeAccount || !account) {
        return ctx.json(
          { error: `Account with the Id: ${transaction.accountId} not found` },
          404
        );
      }

      // Reverse the transaction amount from the account
      await updateAccountBalance(
        transaction.accountId,
        account.balance,
        -transaction.amount,
        auth.userId
      );

      // If one side of a transfer, also delete and reverse the linked transaction
      if (transaction.type === "transfer" && transaction.linkedTransactionId) {
        const [linked] = await db
          .select()
          .from(transactions)
          .where(eq(transactions.id, transaction.linkedTransactionId));

        if (linked) {
          const { data: linkedAccount } = await canUserSeeAccount(
            linked.accountId,
            auth.userId
          );
          if (linkedAccount) {
            await updateAccountBalance(
              linked.accountId,
              linkedAccount.balance,
              -linked.amount,
              auth.userId
            );
          }
          await db
            .delete(transactions)
            .where(eq(transactions.id, transaction.linkedTransactionId));
        }
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
