import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { budgets } from "@/db/schema";

export async function canUserSeeBudget(budgetId: string, userId: string) {
  const [data] = await db
    .select({
      id: budgets.id,
      amount: budgets.amount,
      categoryId: budgets.categoryId,
      type: budgets.type,
      userId: budgets.userId,
    })
    .from(budgets)
    .where(eq(budgets.id, budgetId));

  if (!data) {
    return {
      canSeeBudget: false,
      data: null,
    };
  }

  const canSeeBudget = userId === data.userId;

  return {
    canSeeBudget,
    data: canSeeBudget ? data : null,
  };
}
