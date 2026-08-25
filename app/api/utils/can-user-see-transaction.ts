import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { accounts, transactions } from "@/db/schema";

export async function canUserSeeTransaction(
  transactionId: string,
  userId: string
) {
  const [data] = await db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      payee: transactions.payee,
      description: transactions.description,
      date: transactions.date,
      accountId: transactions.accountId,
      categoryId: transactions.categoryId,
      type: transactions.type,
      recurrence: transactions.recurrence,
      nextDueDate: transactions.nextDueDate,
      linkedTransactionId: transactions.linkedTransactionId,
    })
    .from(transactions)
    .where(eq(transactions.id, transactionId));

  if (!data) {
    return {
      canSeeTransaction: false,
      data: null,
    };
  }

  const [account] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.id, data.accountId));

  const canSeeTransaction = account?.userId === userId;

  return {
    canSeeTransaction,
    data: canSeeTransaction ? data : null,
  };
}
