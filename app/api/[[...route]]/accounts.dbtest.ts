import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";

import { db } from "@/db/drizzle";
import { accounts } from "@/db/schema";
import { PROFILE_COOKIE } from "@/lib/local-auth";
import { resetDb } from "@/tests/db-test-helpers";

import accountsApp from "./accounts";

const USER_A = "user-a";
const USER_B = "user-b";

function cookieFor(userId: string) {
  return `${PROFILE_COOKIE}=${userId}`;
}

async function createAccount(
  userId: string,
  overrides: Partial<{
    name: string;
    holder: string;
    balance: number;
    number: string;
  }> = {}
) {
  const res = await accountsApp.request("/", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieFor(userId) },
    body: JSON.stringify({
      name: "Checking",
      holder: "Jane Doe",
      balance: 100_000,
      number: "1234567890",
      ...overrides,
    }),
  });
  expect(res.status).toBe(200);
  const { data } = await res.json();
  return data;
}

beforeEach(async () => {
  await resetDb();
});

describe("accounts API", () => {
  it("rejects unauthenticated requests", async () => {
    const res = await accountsApp.request("/");
    expect(res.status).toBe(401);
  });

  it("creates an account and encrypts sensitive fields at rest", async () => {
    const created = await createAccount(USER_A);

    expect(created.name).toBe("Checking");
    expect(created.holder).toBe("Jane Doe");
    expect(created.number).toBe("1234567890");

    const [raw] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, created.id));

    expect(raw.holder.startsWith("enc:")).toBe(true);
    expect(raw.number.startsWith("enc:")).toBe(true);
    expect(raw.holder).not.toBe("Jane Doe");
  });

  it("only lists the requesting user's own accounts", async () => {
    await createAccount(USER_A, { name: "A's checking" });
    await createAccount(USER_B, { name: "B's checking" });

    const res = await accountsApp.request("/", {
      headers: { Cookie: cookieFor(USER_A) },
    });
    const { data } = await res.json();

    expect(data).toHaveLength(1);
    expect(data[0].name).toBe("A's checking");
  });

  it("lets the owner fetch their account by id, decrypted", async () => {
    const created = await createAccount(USER_A);

    const res = await accountsApp.request(`/${created.id}`, {
      headers: { Cookie: cookieFor(USER_A) },
    });
    expect(res.status).toBe(200);
    const { data } = await res.json();
    expect(data.holder).toBe("Jane Doe");
    expect(data.number).toBe("1234567890");
  });

  it("returns 404 when another user requests someone else's account", async () => {
    const created = await createAccount(USER_A);

    const res = await accountsApp.request(`/${created.id}`, {
      headers: { Cookie: cookieFor(USER_B) },
    });
    expect(res.status).toBe(404);
  });

  it("blocks another user from patching someone else's account", async () => {
    const created = await createAccount(USER_A);

    const res = await accountsApp.request(`/${created.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieFor(USER_B),
      },
      body: JSON.stringify({
        name: "Hijacked",
        holder: "Mallory",
        balance: 0,
        number: "0000000000",
      }),
    });
    expect(res.status).toBe(404);

    const [raw] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, created.id));
    expect(raw.name).toBe("Checking");
  });

  it("blocks another user from deleting someone else's account", async () => {
    const created = await createAccount(USER_A);

    const res = await accountsApp.request(`/${created.id}`, {
      method: "DELETE",
      headers: { Cookie: cookieFor(USER_B) },
    });
    expect(res.status).toBe(404);

    const [raw] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, created.id));
    expect(raw).toBeDefined();
  });

  it("lets the owner delete their own account", async () => {
    const created = await createAccount(USER_A);

    const res = await accountsApp.request(`/${created.id}`, {
      method: "DELETE",
      headers: { Cookie: cookieFor(USER_A) },
    });
    expect(res.status).toBe(200);

    const [raw] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, created.id));
    expect(raw).toBeUndefined();
  });
});
