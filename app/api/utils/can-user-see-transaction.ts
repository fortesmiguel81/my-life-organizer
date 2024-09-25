import { and, eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { accounts, memberships, transactions } from "@/db/schema";

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
    })
    .from(transactions)
    .where(eq(transactions.id, transactionId));

  if (!data) {
    return {
      canSeeTransaction: false,
      data: null,
    };
  }

  const { accountId } = data;

  const [account] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.id, accountId));

  if (!account) {
    return { canSeeTransaction: false, data: null };
  }

  if (account.userId === userId) {
    return { canSeeTransaction: false, data: data, error: null };
  }

  const [hasOrganizationAccess] = await db
    .select()
    .from(memberships)
    .where(
      and(eq(memberships.userId, userId), eq(memberships.orgId, account.orgId!))
    );

  return {
    canSeeTransaction: hasOrganizationAccess !== null,
    data: hasOrganizationAccess !== null ? data : null,
  };
}
