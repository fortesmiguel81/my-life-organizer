import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { and, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { insertTaskListSchema, taskLists, tasks } from "@/db/schema";

const app = new Hono()
  .get("/", clerkMiddleware(), async (ctx) => {
    const auth = getAuth(ctx);
    if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

    const userFilter = auth.orgId
      ? eq(taskLists.orgId, auth.orgId)
      : eq(taskLists.userId, auth.userId);

    const data = await db
      .select({
        id: taskLists.id,
        name: taskLists.name,
        icon: taskLists.icon,
        color: taskLists.color,
        taskCount: sql<number>`cast(count(${tasks.id}) as int)`,
      })
      .from(taskLists)
      .leftJoin(tasks, eq(tasks.listId, taskLists.id))
      .where(userFilter)
      .groupBy(taskLists.id);

    return ctx.json({ data });
  })
  .post(
    "/",
    clerkMiddleware(),
    zValidator(
      "json",
      insertTaskListSchema.omit({
        id: true,
        userId: true,
        orgId: true,
        created_at: true,
        created_by: true,
        updated_at: true,
        updated_by: true,
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const values = ctx.req.valid("json");
      const now = new Date();

      const [data] = await db
        .insert(taskLists)
        .values({
          id: createId(),
          ...values,
          userId: auth.orgId ? null : auth.userId,
          orgId: auth.orgId ?? null,
          created_at: now,
          created_by: auth.userId,
          updated_at: now,
          updated_by: auth.userId,
        })
        .returning();

      return ctx.json({ data }, 201);
    }
  )
  .patch(
    "/:id",
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string() })),
    zValidator(
      "json",
      insertTaskListSchema.omit({
        id: true,
        userId: true,
        orgId: true,
        created_at: true,
        created_by: true,
        updated_at: true,
        updated_by: true,
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { id } = ctx.req.valid("param");
      const values = ctx.req.valid("json");

      const userFilter = auth.orgId
        ? eq(taskLists.orgId, auth.orgId)
        : eq(taskLists.userId, auth.userId);

      const [data] = await db
        .update(taskLists)
        .set({ ...values, updated_at: new Date(), updated_by: auth.userId })
        .where(and(eq(taskLists.id, id), userFilter))
        .returning();

      if (!data) return ctx.json({ error: "List not found" }, 404);

      return ctx.json({ data });
    }
  )
  .delete(
    "/:id",
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string() })),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { id } = ctx.req.valid("param");

      const userFilter = auth.orgId
        ? eq(taskLists.orgId, auth.orgId)
        : eq(taskLists.userId, auth.userId);

      const [data] = await db
        .delete(taskLists)
        .where(and(eq(taskLists.id, id), userFilter))
        .returning();

      if (!data) return ctx.json({ error: "List not found" }, 404);

      return ctx.json({ data });
    }
  );

export default app;
