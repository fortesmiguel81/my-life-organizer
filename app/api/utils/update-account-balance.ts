import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { accounts } from "@/db/schema";

export async function updateAccountBalance(
  accountId: string,
  balance: number,
  amount: number,
  userId: string
) {
  console.log("accountId", accountId);
  console.log("balance", balance);
  console.log("amount", amount);

  const newBalance = balance + amount;
  console.log("newBalance:", newBalance);

  const [updatedAccount] = await db
    .update(accounts)
    .set({
      balance: newBalance,
      updated_at: new Date(),
      updated_by: userId,
    })
    .where(eq(accounts.id, accountId))
    .returning();

  return updatedAccount;
}
