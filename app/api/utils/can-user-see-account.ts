import { and, eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { accounts, memberships } from "@/db/schema";

export async function canUserSeeAccount(accountId: string, userId: string) {
  const [data] = await db
    .select({
      id: accounts.id,
      name: accounts.name,
      holder: accounts.holder,
      balance: accounts.balance,
      number: accounts.number,
      bankIcon: accounts.bankIcon,
      userId: accounts.userId,
      orgId: accounts.orgId,
    })
    .from(accounts)
    .where(eq(accounts.id, accountId));

  if (!data) {
    return {
      canSeeAccount: false,
      data: null,
    };
  }

  const { orgId, userId: accountUserId } = data;

  if (userId === accountUserId) {
    return { canSeeAccount: true, data: data, error: null };
  }

  const [hasOrganizationAccess] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.userId, userId), eq(memberships.orgId, orgId!)));

  return {
    canSeeAccount: hasOrganizationAccess !== null,
    data: hasOrganizationAccess !== null ? data : null,
  };
}
