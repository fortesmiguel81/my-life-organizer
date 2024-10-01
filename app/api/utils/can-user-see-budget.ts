import { and, eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { budgets, memberships } from "@/db/schema";

export async function canUserSeeBudget(budgetId: string, userId: string) {
  const [data] = await db
    .select({
      id: budgets.id,
      amount: budgets.amount,
      categoryId: budgets.categoryId,
      type: budgets.type,
      userId: budgets.userId,
      orgId: budgets.orgId,
    })
    .from(budgets)
    .where(eq(budgets.id, budgetId));

  if (!data) {
    return {
      canSeeBudget: false,
      data: null,
    };
  }

  const { orgId, userId: categoryUserId } = data;

  if (userId === categoryUserId) {
    return { canSeeBudget: true, data: data, error: null };
  }

  const [hasOrganizationAccess] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.userId, userId), eq(memberships.orgId, orgId!)));

  return {
    canSeeBudget: hasOrganizationAccess !== null,
    data: hasOrganizationAccess !== null ? data : null,
  };
}
