import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const memberships = pgTable("memberships", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  orgId: text("org_id"),
  created_at: timestamp("created_at", { mode: "date" }).notNull(),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  holder: text("holder").notNull(),
  balance: integer("balance").notNull(),
  number: text("number").notNull(),
  bankIcon: text("bank_icon"),
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

export const insertAccountSchema = createInsertSchema(accounts);

export const budgetFrequencyEnum = pgEnum("budgetFrequency", [
  "monthly",
  "yearly",
]);

export const budgets = pgTable("budgets", {
  id: text("id").primaryKey(),
  amount: integer("amount").notNull(),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id, {
      onDelete: "cascade",
    }),
  type: budgetFrequencyEnum("type").notNull(),
  userId: text("user_id"),
  orgId: text("org_id"),
  created_at: timestamp("created_at", { mode: "date" }).notNull(),
  created_by: text("created_by").notNull(),
  updated_at: timestamp("updated_at", { mode: "date" }).notNull(),
  updated_by: text("updated_by").notNull(),
});

export const budgetsRelations = relations(budgets, ({ one }) => ({
  category: one(categories, {
    fields: [budgets.categoryId],
    references: [categories.id],
  }),
}));

export const insertBudgetSchema = createInsertSchema(budgets);

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  userId: text("user_id"),
  orgId: text("org_id"),
  created_at: timestamp("created_at", { mode: "date" }).notNull(),
  created_by: text("created_by").notNull(),
  updated_at: timestamp("updated_at", { mode: "date" }).notNull(),
  updated_by: text("updated_by").notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions),
  budgets: many(budgets),
}));

export const insertCategorySchema = createInsertSchema(categories);

export const transactionTypeEnum = pgEnum("transactionType", [
  "income",
  "expense",
  "transfer",
]);

export const recurrenceFrequencyEnum = pgEnum("recurrenceFrequency", [
  "none",
  "daily",
  "weekly",
  "biweekly",
  "monthly",
  "yearly",
]);

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
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  type: transactionTypeEnum("type").notNull().default("expense"),
  recurrence: recurrenceFrequencyEnum("recurrence").notNull().default("none"),
  nextDueDate: timestamp("next_due_date", { mode: "date" }),
  linkedTransactionId: text("linked_transaction_id"),
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
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}));

export const insertTransactionSchema = createInsertSchema(transactions, {
  date: z.coerce.date(),
});
