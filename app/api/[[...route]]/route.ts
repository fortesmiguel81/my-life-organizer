import { Hono } from "hono";
import { handle } from "hono/vercel";

import accounts from "./accounts";
import budgets from "./budgets";
import categories from "./categories";
import events from "./events";
import googleCalendar from "./google-calendar";
import recurring from "./recurring";
import summary from "./summary";
import transactions from "./transactions";
import webhooks from "./webhooks";

export const runtime = "edge";

const app = new Hono().basePath("/api");

const routes = app
  .route("/webhooks", webhooks)
  .route("/accounts", accounts)
  .route("/transactions", transactions)
  .route("/categories", categories)
  .route("/budgets", budgets)
  .route("/summary", summary)
  .route("/recurring", recurring)
  .route("/events", events)
  .route("/google-calendar", googleCalendar);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
