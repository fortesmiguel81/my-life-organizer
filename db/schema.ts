import { relations } from "drizzle-orm";
import { boolean, integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
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

export const events = pgTable("events", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date", { mode: "date" }).notNull(),
  endDate: timestamp("end_date", { mode: "date" }).notNull(),
  allDay: boolean("all_day").notNull().default(false),
  location: text("location"),
  color: text("color"),
  googleEventId: text("google_event_id"),
  googleCalendarId: text("google_calendar_id"),
  notifyBefore: integer("notify_before").default(30),
  notified: boolean("notified").notNull().default(false),
  userId: text("user_id"),
  orgId: text("org_id"),
  created_at: timestamp("created_at", { mode: "date" }).notNull(),
  created_by: text("created_by").notNull(),
  updated_at: timestamp("updated_at", { mode: "date" }).notNull(),
  updated_by: text("updated_by").notNull(),
});

export const insertEventSchema = createInsertSchema(events, {
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export const googleTokens = pgTable("google_tokens", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at", { mode: "date" }),
  scope: text("scope"),
  created_at: timestamp("created_at", { mode: "date" }).notNull(),
  updated_at: timestamp("updated_at", { mode: "date" }).notNull(),
});

export const taskStatusEnum = pgEnum("taskStatus", [
  "todo",
  "in_progress",
  "done",
]);

export const taskPriorityEnum = pgEnum("taskPriority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

export const taskLists = pgTable("task_lists", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon"),
  color: text("color"),
  userId: text("user_id"),
  orgId: text("org_id"),
  created_at: timestamp("created_at", { mode: "date" }).notNull(),
  created_by: text("created_by").notNull(),
  updated_at: timestamp("updated_at", { mode: "date" }).notNull(),
  updated_by: text("updated_by").notNull(),
});

export const insertTaskListSchema = createInsertSchema(taskLists);

export const tasks = pgTable("tasks", {
  id: text("id").primaryKey(),
  listId: text("list_id")
    .notNull()
    .references(() => taskLists.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").notNull().default("todo"),
  priority: taskPriorityEnum("priority").notNull().default("medium"),
  dueDate: timestamp("due_date", { mode: "date" }),
  assignedTo: text("assigned_to"),
  parentId: text("parent_id"),
  calendarEventId: text("calendar_event_id"),
  userId: text("user_id"),
  orgId: text("org_id"),
  created_at: timestamp("created_at", { mode: "date" }).notNull(),
  created_by: text("created_by").notNull(),
  updated_at: timestamp("updated_at", { mode: "date" }).notNull(),
  updated_by: text("updated_by").notNull(),
});

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  list: one(taskLists, { fields: [tasks.listId], references: [taskLists.id] }),
  subtasks: many(tasks, { relationName: "subtasks" }),
  parent: one(tasks, {
    fields: [tasks.parentId],
    references: [tasks.id],
    relationName: "subtasks",
  }),
}));

export const insertTaskSchema = createInsertSchema(tasks, {
  dueDate: z.coerce.date().optional().nullable(),
});
