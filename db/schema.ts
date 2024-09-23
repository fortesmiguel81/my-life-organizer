import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const memberships = pgTable("memberships", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  orgId: text("org_id"),
  created_at: timestamp("created_at", { mode: "date" }).notNull(),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  userId: text("user_id"),
  orgId: text("org_id"),
  created_at: timestamp("created_at", { mode: "date" }).notNull(),
  created_by: text("created_by").notNull(),
  updated_at: timestamp("updated_at", { mode: "date" }).notNull(),
  updated_by: text("updated_by").notNull(),
});

export const accountsRelations = relations(accounts, ({ many }) => ({
  transactions: many(transactions),
}));

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  amount: integer("amount").notNull(),
  payee: text("payee").notNull(),
  description: text("description").notNull(),
  date: timestamp("date", { mode: "date" }).notNull(),
  accountId: text("account_id")
    .references(() => accounts.id, {
      onDelete: "cascade",
    })
    .notNull(),
  created_at: timestamp("created_at", { mode: "date" }).notNull(),
  created_by: text("created_by").notNull(),
  updated_at: timestamp("updated_at", { mode: "date" }).notNull(),
  updated_by: text("updated_by").notNull(),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
}));

export const insertTransactionSchema = createInsertSchema(transactions);
