import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { accounts } from "@/db/schema";

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
    })
    .from(accounts)
    .where(eq(accounts.id, accountId));

  if (!data) {
    return {
      canSeeAccount: false,
      data: null,
    };
  }

  const canSeeAccount = userId === data.userId;

  return {
    canSeeAccount,
    data: canSeeAccount ? data : null,
  };
}
