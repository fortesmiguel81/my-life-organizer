import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";

import { db } from "@/db/drizzle";
import { transactions } from "@/db/schema";
import { PROFILE_COOKIE } from "@/lib/local-auth";
import { resetDb } from "@/tests/db-test-helpers";

import accountsApp from "./accounts";
import transactionsApp from "./transactions";

const USER_A = "user-a";
const USER_B = "user-b";

function cookieFor(userId: string) {
  return `${PROFILE_COOKIE}=${userId}`;
}

async function createAccount(userId: string) {
  const res = await accountsApp.request("/", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieFor(userId) },
    body: JSON.stringify({
      name: "Checking",
      holder: "Jane Doe",
      balance: 100_000,
      number: "1234567890",
    }),
  });
  const { data } = await res.json();
  return data;
}

async function createTransaction(userId: string, accountId: string) {
  const res = await transactionsApp.request("/", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieFor(userId) },
    body: JSON.stringify({
      amount: -5000,
      payee: "Grocery Store",
      description: "Weekly groceries",
      date: new Date().toISOString(),
      accountId,
      type: "expense",
      recurrence: "none",
    }),
  });
  return res;
}

beforeEach(async () => {
  await resetDb();
});

describe("transactions API cross-user access control", () => {
  it("rejects creating a transaction against another user's account", async () => {
    const accountA = await createAccount(USER_A);

    const res = await createTransaction(USER_B, accountA.id);
    expect(res.status).toBe(404);

    const rows = await db
      .select()
      .from(transactions)
      .where(eq(transactions.accountId, accountA.id));
    expect(rows).toHaveLength(0);
  });

  it("lets the owner read their transaction, decrypted, via the account join", async () => {
    const accountA = await createAccount(USER_A);
    const createRes = await createTransaction(USER_A, accountA.id);
    expect(createRes.status).toBe(201);
    const { data: created } = await createRes.json();

    const res = await transactionsApp.request(`/${created.id}`, {
      headers: { Cookie: cookieFor(USER_A) },
    });
    expect(res.status).toBe(200);
    const { data } = await res.json();
    expect(data.payee).toBe("Grocery Store");
    expect(data.description).toBe("Weekly groceries");
  });

  it("returns 404 when another user reads a transaction via someone else's account", async () => {
    const accountA = await createAccount(USER_A);
    const { data: created } = await (
      await createTransaction(USER_A, accountA.id)
    ).json();

    const res = await transactionsApp.request(`/${created.id}`, {
      headers: { Cookie: cookieFor(USER_B) },
    });
    expect(res.status).toBe(404);
  });

  it("blocks another user from deleting a transaction reached through someone else's account", async () => {
    const accountA = await createAccount(USER_A);
    const { data: created } = await (
      await createTransaction(USER_A, accountA.id)
    ).json();

    const res = await transactionsApp.request(`/${created.id}`, {
      method: "DELETE",
      headers: { Cookie: cookieFor(USER_B) },
    });
    expect(res.status).toBe(404);

    const [raw] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, created.id));
    expect(raw).toBeDefined();
  });

  it("excludes another user's transactions from the list endpoint", async () => {
    const accountA = await createAccount(USER_A);
    const accountB = await createAccount(USER_B);
    await createTransaction(USER_A, accountA.id);
    await createTransaction(USER_B, accountB.id);

    const res = await transactionsApp.request("/", {
      headers: { Cookie: cookieFor(USER_A) },
    });
    const { data } = await res.json();

    expect(data).toHaveLength(1);
    expect(data[0].payee).toBe("Grocery Store");
  });
});
