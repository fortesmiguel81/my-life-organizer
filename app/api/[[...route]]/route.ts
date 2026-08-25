import { Hono } from "hono";
import { handle } from "hono/vercel";

import accounts from "./accounts";
import budgets from "./budgets";
import categories from "./categories";
import documentsRoute from "./documents";
import events from "./events";
import googleCalendar from "./google-calendar";
import habitsRoute from "./habits";
import profilesRoute from "./profiles";
import recurring from "./recurring";
import shoppingItemsRoute from "./shopping-items";
import shoppingListsRoute from "./shopping-lists";
import summary from "./summary";
import taskListsRoute from "./task-lists";
import tasksRoute from "./tasks";
import transactions from "./transactions";
import vendorQuotesRoute from "./vendor-quotes";
import vendorsRoute from "./vendors";

const app = new Hono().basePath("/api");

const routes = app
  .route("/profiles", profilesRoute)
  .route("/accounts", accounts)
  .route("/transactions", transactions)
  .route("/categories", categories)
  .route("/budgets", budgets)
  .route("/summary", summary)
  .route("/recurring", recurring)
  .route("/events", events)
  .route("/google-calendar", googleCalendar)
  .route("/task-lists", taskListsRoute)
  .route("/tasks", tasksRoute)
  .route("/shopping-lists", shoppingListsRoute)
  .route("/shopping-items", shoppingItemsRoute)
  .route("/documents", documentsRoute)
  .route("/habits", habitsRoute)
  .route("/vendors", vendorsRoute)
  .route("/vendor-quotes", vendorQuotesRoute);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
