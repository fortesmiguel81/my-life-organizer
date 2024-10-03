import { and, eq, gte, lte, sql, sum } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { accounts, transactions } from "@/db/schema";

export async function fetchFinancialData(
  userId: string,
  startDate: Date,
  endDate: Date,
  orgId?: string,
  accountId?: string
) {
  const queryConditions = [
    orgId ? eq(accounts.orgId, orgId) : eq(accounts.userId, userId),
    gte(transactions.date, startDate),
    lte(transactions.date, endDate),
  ];

  if (accountId) {
    queryConditions.push(eq(transactions.accountId, accountId));
  }

  const [result] = await db
    .select({
      income:
        sql`SUM(CASE WHEN ${transactions.amount} >= 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(
          Number
        ),
      expenses:
        sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(
          Number
        ),
      remaining: sum(transactions.amount).mapWith(Number),
    })
    .from(transactions)
    .innerJoin(accounts, eq(transactions.accountId, accounts.id))
    .where(and(...queryConditions));

  return {
    income: result.income ?? 0,
    expenses: result.expenses ?? 0,
    remaining: result.remaining ?? 0,
  };
}
