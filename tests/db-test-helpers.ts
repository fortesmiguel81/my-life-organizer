import { sql } from "drizzle-orm";

import { db } from "@/db/drizzle";

/**
 * Truncates every application table and resets identity sequences.
 * Call from beforeEach so each test starts from an empty database —
 * table IDs in this schema are cuid2 strings (no identity sequences),
 * but RESTART IDENTITY is harmless and future-proofs any table that
 * does add one.
 */
export async function resetDb() {
  await db.execute(sql`
    TRUNCATE TABLE
      accounts, budgets, categories, transactions,
      events, google_tokens, task_lists, tasks,
      shopping_lists, shopping_items, documents,
      habits, habit_logs, vendors, vendor_quotes,
      assets, maintenance_tasks, maintenance_logs,
      utility_readings, profiles
    RESTART IDENTITY CASCADE
  `);
}
