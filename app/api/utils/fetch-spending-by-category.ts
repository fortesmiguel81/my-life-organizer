import { and, desc, eq, gte, lt, lte, sql } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { accounts, categories, transactions } from "@/db/schema";

export async function fetchSpendingByCategory(
  userId: string,
  startDate: Date,
  endDate: Date,
  orgId?: string,
  accountId?: string
) {
  const queryConditions = [
    orgId ? eq(accounts.orgId, orgId) : eq(accounts.userId, userId),
    lt(transactions.amount, 0),
    gte(transactions.date, startDate),
    lte(transactions.date, endDate),
  ];

  if (accountId) {
    queryConditions.push(eq(transactions.accountId, accountId));
  }

  const category = await db
    .select({
      name: sql<string>`COALESCE(${categories.name}, 'Uncategorized')`,
      value: sql`SUM(ABS(${transactions.amount}))`.mapWith(Number),
    })
    .from(transactions)
    .innerJoin(accounts, eq(transactions.accountId, accounts.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(...queryConditions))
    .groupBy(sql`COALESCE(${categories.name}, 'Uncategorized')`)
    .orderBy(desc(sql`SUM(ABS(${transactions.amount}))`.mapWith(Number)));

  const topCategories = category.slice(0, 3);
  const otherCategories = category.slice(3);
  const otherSum = otherCategories.reduce(
    (sum, current) => sum + current.value,
    0
  );

  const finalCategories = topCategories;
  if (otherCategories.length > 0) {
    finalCategories.push({ name: "Other", value: otherSum });
  }

  return finalCategories;
}
