import { Hono } from "hono";
import { handle } from "hono/vercel";

import transactions from "./transactions";
import webhooks from "./webhooks";

export const runtime = "edge";

const app = new Hono().basePath("/api");

const routes = app
  .route("/webhooks", webhooks)
  .route("/transactions", transactions);

export const GET = handle(app);
export const POST = handle(app);

export type AppType = typeof routes;
