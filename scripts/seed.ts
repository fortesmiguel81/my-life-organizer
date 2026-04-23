/**
 * Seed script — populates all tables with realistic sample data.
 *
 * Requires in .env.local:
 *   SEED_USER_ID  — from https://dashboard.clerk.com → Users
 *   SEED_ORG_ID   — from https://dashboard.clerk.com → Organizations (optional)
 *
 * Usage:  npm run db:seed
 */
import { neon } from "@neondatabase/serverless";
import { createId } from "@paralleldrive/cuid2";
import { addDays, subDays } from "date-fns";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";

import {
  accounts,
  budgets,
  categories,
  events,
  taskLists,
  tasks,
  transactions,
} from "../db/schema";
import { encryptField } from "../lib/encryption";

config({ path: ".env.local" });

// ── DB (same proxy as db/drizzle.ts) ─────────────────────────────────────────
const neonSql = neon(process.env.DATABASE_URL!);
const clientProxy = new Proxy(neonSql, {
  apply: (_t, _this, args) =>
    (
      neonSql as unknown as {
        query: (
          text: string,
          params?: unknown[],
          opts?: unknown
        ) => Promise<unknown>;
      }
    ).query(args[0], args[1], args[2]),
});
const db = drizzle(clientProxy as typeof neonSql);

// ── Config ────────────────────────────────────────────────────────────────────
const userId = process.env.SEED_USER_ID;
const orgId = process.env.SEED_ORG_ID ?? null;

if (!userId) {
  console.error("\n❌  SEED_USER_ID not set in .env.local\n");
  process.exit(1);
}

// When an org is present the scoping userId is null (matches app behaviour)
const scopeUserId = orgId ? null : userId;

const now = new Date();
const ago = (n: number) => subDays(now, n);
const ahead = (n: number) => addDays(now, n);

const base = () => ({
  userId: scopeUserId,
  orgId,
  created_at: now,
  created_by: userId,
  updated_at: now,
  updated_by: userId,
});

async function enc(v: string) {
  return (await encryptField(v)) ?? v;
}

// ── Seed ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🌱  Seeding…`);
  console.log(`   userId : ${userId}`);
  console.log(`   orgId  : ${orgId ?? "(none — personal account)"}\n`);

  // 1. Categories ──────────────────────────────────────────────────────────────
  const catDefs = [
    { name: "Housing", icon: "🏠" },
    { name: "Groceries", icon: "🛒" },
    { name: "Transport", icon: "🚗" },
    { name: "Dining Out", icon: "🍽️" },
    { name: "Health", icon: "💊" },
    { name: "Entertainment", icon: "🎬" },
    { name: "Utilities", icon: "⚡" },
    { name: "Income", icon: "💰" },
  ];

  const insertedCats = await db
    .insert(categories)
    .values(
      catDefs.map((c) => ({
        id: createId(),
        name: c.name,
        icon: c.icon,
        description: null,
        ...base(),
      }))
    )
    .returning();

  const cat = (name: string) => insertedCats.find((c) => c.name === name)!;
  console.log(`✓  ${insertedCats.length} categories`);

  // 2. Accounts ────────────────────────────────────────────────────────────────
  const [checkingId, savingsId, creditId] = [
    createId(),
    createId(),
    createId(),
  ];

  await db.insert(accounts).values([
    {
      id: checkingId,
      name: "Checking Account",
      holder: await enc("Miguel Fortes"),
      balance: 350000,
      number: await enc("GB82WEST12345698765432"),
      bankIcon: null,
      ...base(),
    },
    {
      id: savingsId,
      name: "Savings Account",
      holder: await enc("Miguel Fortes"),
      balance: 1500000,
      number: await enc("GB82WEST12345698765433"),
      bankIcon: null,
      ...base(),
    },
    {
      id: creditId,
      name: "Credit Card",
      holder: await enc("Miguel Fortes"),
      balance: -85000,
      number: await enc("4111111111111111"),
      bankIcon: null,
      ...base(),
    },
  ]);
  console.log("✓  3 accounts");

  // 3. Budgets ─────────────────────────────────────────────────────────────────
  await db.insert(budgets).values([
    {
      id: createId(),
      amount: 200000,
      categoryId: cat("Housing").id,
      type: "monthly",
      ...base(),
    },
    {
      id: createId(),
      amount: 50000,
      categoryId: cat("Groceries").id,
      type: "monthly",
      ...base(),
    },
    {
      id: createId(),
      amount: 30000,
      categoryId: cat("Dining Out").id,
      type: "monthly",
      ...base(),
    },
    {
      id: createId(),
      amount: 20000,
      categoryId: cat("Entertainment").id,
      type: "monthly",
      ...base(),
    },
    {
      id: createId(),
      amount: 15000,
      categoryId: cat("Transport").id,
      type: "monthly",
      ...base(),
    },
  ]);
  console.log("✓  5 budgets");

  // 4. Transactions ────────────────────────────────────────────────────────────
  type TxDef = {
    payee: string;
    amount: number;
    type: "income" | "expense";
    catName: string;
    date: Date;
    accountId: string;
    description: string;
  };

  const txDefs: TxDef[] = [
    {
      payee: "Employer Ltd",
      amount: 450000,
      type: "income",
      catName: "Income",
      date: ago(28),
      accountId: checkingId,
      description: "Monthly salary",
    },
    {
      payee: "Landlord",
      amount: -180000,
      type: "expense",
      catName: "Housing",
      date: ago(26),
      accountId: checkingId,
      description: "Monthly rent",
    },
    {
      payee: "Whole Foods Market",
      amount: -12500,
      type: "expense",
      catName: "Groceries",
      date: ago(24),
      accountId: checkingId,
      description: "Weekly shop",
    },
    {
      payee: "EDF Energy",
      amount: -9500,
      type: "expense",
      catName: "Utilities",
      date: ago(22),
      accountId: checkingId,
      description: "Electricity & gas",
    },
    {
      payee: "Netflix",
      amount: -1500,
      type: "expense",
      catName: "Entertainment",
      date: ago(20),
      accountId: creditId,
      description: "",
    },
    {
      payee: "Shell Petrol",
      amount: -8000,
      type: "expense",
      catName: "Transport",
      date: ago(18),
      accountId: checkingId,
      description: "Fuel",
    },
    {
      payee: "Dr. Smith Clinic",
      amount: -5000,
      type: "expense",
      catName: "Health",
      date: ago(15),
      accountId: creditId,
      description: "Annual checkup",
    },
    {
      payee: "Whole Foods Market",
      amount: -14000,
      type: "expense",
      catName: "Groceries",
      date: ago(12),
      accountId: checkingId,
      description: "Weekly shop",
    },
    {
      payee: "Pizza Palace",
      amount: -4500,
      type: "expense",
      catName: "Dining Out",
      date: ago(9),
      accountId: creditId,
      description: "Dinner with wife",
    },
    {
      payee: "Thames Water",
      amount: -4200,
      type: "expense",
      catName: "Utilities",
      date: ago(8),
      accountId: checkingId,
      description: "Water bill",
    },
    {
      payee: "Spotify",
      amount: -999,
      type: "expense",
      catName: "Entertainment",
      date: ago(6),
      accountId: creditId,
      description: "",
    },
    {
      payee: "Whole Foods Market",
      amount: -11000,
      type: "expense",
      catName: "Groceries",
      date: ago(4),
      accountId: checkingId,
      description: "Weekly shop",
    },
    {
      payee: "Uber",
      amount: -2500,
      type: "expense",
      catName: "Transport",
      date: ago(2),
      accountId: checkingId,
      description: "",
    },
    {
      payee: "Bistro 24",
      amount: -6800,
      type: "expense",
      catName: "Dining Out",
      date: ago(1),
      accountId: creditId,
      description: "Lunch",
    },
  ];

  await db.insert(transactions).values(
    await Promise.all(
      txDefs.map(async (tx) => ({
        id: createId(),
        amount: tx.amount,
        payee: await enc(tx.payee),
        description: await enc(tx.description),
        date: tx.date,
        accountId: tx.accountId,
        categoryId: cat(tx.catName).id,
        type: tx.type,
        recurrence: "none" as const,
        nextDueDate: null,
        linkedTransactionId: null,
        ...base(),
      }))
    )
  );
  console.log(`✓  ${txDefs.length} transactions`);

  // 5. Events ──────────────────────────────────────────────────────────────────
  await db.insert(events).values([
    {
      id: createId(),
      title: "Doctor Appointment",
      description: "Annual checkup — Dr. Smith",
      startDate: ahead(3),
      endDate: ahead(3),
      allDay: false,
      location: "Smith Medical Centre",
      color: "#ef4444",
      googleEventId: null,
      googleCalendarId: null,
      notifyBefore: 60,
      notified: false,
      ...base(),
    },
    {
      id: createId(),
      title: "Moving Day 🎉",
      description: "Keys handover at 9am",
      startDate: ahead(14),
      endDate: ahead(14),
      allDay: true,
      location: "New Home",
      color: "#22c55e",
      googleEventId: null,
      googleCalendarId: null,
      notifyBefore: 1440,
      notified: false,
      ...base(),
    },
    {
      id: createId(),
      title: "Anniversary Dinner",
      description: "Reservation — 8pm",
      startDate: ahead(21),
      endDate: ahead(21),
      allDay: false,
      location: "La Maison Restaurant",
      color: "#ec4899",
      googleEventId: null,
      googleCalendarId: null,
      notifyBefore: 60,
      notified: false,
      ...base(),
    },
    {
      id: createId(),
      title: "Broadband Installation",
      description: "Engineer visit 10am–2pm",
      startDate: ahead(16),
      endDate: ahead(16),
      allDay: false,
      location: "Home",
      color: "#3b82f6",
      googleEventId: null,
      googleCalendarId: null,
      notifyBefore: 60,
      notified: false,
      ...base(),
    },
  ]);
  console.log("✓  4 events");

  // 6. Task lists ──────────────────────────────────────────────────────────────
  const [houseListId, financeListId, personalListId] = [
    createId(),
    createId(),
    createId(),
  ];

  await db.insert(taskLists).values([
    {
      id: houseListId,
      name: "House Setup",
      icon: "🏠",
      color: "#22c55e",
      ...base(),
    },
    {
      id: financeListId,
      name: "Finance",
      icon: "💰",
      color: "#3b82f6",
      ...base(),
    },
    {
      id: personalListId,
      name: "Personal",
      icon: "✅",
      color: "#8b5cf6",
      ...base(),
    },
  ]);
  console.log("✓  3 task lists");

  // 7. Tasks ───────────────────────────────────────────────────────────────────
  const mkTask = (
    listId: string,
    title: string,
    status: "todo" | "in_progress" | "done",
    priority: "low" | "medium" | "high" | "urgent",
    dueDate: Date | null,
    description?: string
  ) => ({
    id: createId(),
    listId,
    title,
    status,
    priority,
    description: description ?? null,
    dueDate,
    assignedTo: null,
    parentId: null,
    calendarEventId: null,
    ...base(),
  });

  await db
    .insert(tasks)
    .values([
      mkTask(houseListId, "Book moving company", "done", "urgent", ahead(10)),
      mkTask(
        houseListId,
        "Set up broadband internet",
        "in_progress",
        "high",
        ahead(16),
        "Call ISP to arrange engineer visit"
      ),
      mkTask(
        houseListId,
        "Purchase bedroom furniture",
        "todo",
        "high",
        ahead(20)
      ),
      mkTask(
        houseListId,
        "Register new address with bank",
        "todo",
        "medium",
        ahead(18)
      ),
      mkTask(
        houseListId,
        "Set up utility accounts",
        "todo",
        "urgent",
        ahead(15),
        "Electricity, gas, water"
      ),
      mkTask(
        houseListId,
        "Deep clean before move-in",
        "todo",
        "medium",
        ahead(13)
      ),

      mkTask(
        financeListId,
        "Set up household budget",
        "in_progress",
        "high",
        ahead(5)
      ),
      mkTask(
        financeListId,
        "Cancel unused subscriptions",
        "todo",
        "medium",
        null
      ),
      mkTask(
        financeListId,
        "Set up direct debits",
        "todo",
        "high",
        ahead(18),
        "Rent, utilities, insurance"
      ),
      mkTask(financeListId, "Open joint account", "todo", "medium", ahead(30)),

      mkTask(personalListId, "Book annual checkup", "done", "medium", ago(2)),
      mkTask(personalListId, "Renew driving licence", "todo", "low", ahead(60)),
      mkTask(
        personalListId,
        "Research home insurance",
        "todo",
        "high",
        ahead(12)
      ),
    ]);
  console.log("✓  13 tasks");

  console.log("\n✅  Seed complete!\n");
}

main().catch((err) => {
  console.error("\n❌  Seed failed:", err);
  process.exit(1);
});
