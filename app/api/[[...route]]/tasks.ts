import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { and, asc, eq, isNull } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { insertTaskSchema, taskLists, tasks } from "@/db/schema";

const app = new Hono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        listId: z.string().optional(),
        status: z.enum(["todo", "in_progress", "done"]).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      })
    ),
    clerkMiddleware(),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { listId, status, priority } = ctx.req.valid("query");
      const userFilter = auth.orgId
        ? eq(taskLists.orgId, auth.orgId)
        : eq(taskLists.userId, auth.userId);

      const conditions: Parameters<typeof and>[0][] = [
        userFilter,
        isNull(tasks.parentId),
      ];
      if (listId) conditions.push(eq(tasks.listId, listId));
      if (status) conditions.push(eq(tasks.status, status));
      if (priority) conditions.push(eq(tasks.priority, priority));

      const rows = await db
        .select({
          id: tasks.id,
          listId: tasks.listId,
          title: tasks.title,
          description: tasks.description,
          status: tasks.status,
          priority: tasks.priority,
          order: tasks.order,
          dueDate: tasks.dueDate,
          assignedTo: tasks.assignedTo,
          parentId: tasks.parentId,
          calendarEventId: tasks.calendarEventId,
          created_at: tasks.created_at,
          updated_at: tasks.updated_at,
        })
        .from(tasks)
        .innerJoin(taskLists, eq(tasks.listId, taskLists.id))
        .where(and(...conditions))
        .orderBy(asc(tasks.order), asc(tasks.created_at));

      // Attach subtask counts in a single extra query
      const subtaskRows = await db
        .select({ parentId: tasks.parentId })
        .from(tasks)
        .innerJoin(taskLists, eq(tasks.listId, taskLists.id))
        .where(and(userFilter));

      const subtasksMap: Record<string, number> = {};
      for (const r of subtaskRows) {
        if (r.parentId) subtasksMap[r.parentId] = (subtasksMap[r.parentId] ?? 0) + 1;
      }

      const data = rows.map((t) => ({ ...t, subtaskCount: subtasksMap[t.id] ?? 0 }));
      return ctx.json({ data });
    }
  )
  .get(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    clerkMiddleware(),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { id } = ctx.req.valid("param");
      const userFilter = auth.orgId
        ? eq(taskLists.orgId, auth.orgId)
        : eq(taskLists.userId, auth.userId);

      const [row] = await db
        .select({ tasks })
        .from(tasks)
        .innerJoin(taskLists, eq(tasks.listId, taskLists.id))
        .where(and(eq(tasks.id, id), userFilter));

      if (!row) return ctx.json({ error: "Task not found" }, 404);

      const subtasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.parentId, id));

      return ctx.json({ data: { ...row.tasks, subtasks } });
    }
  )
  .post(
    "/",
    clerkMiddleware(),
    zValidator(
      "json",
      insertTaskSchema.omit({
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
        .insert(tasks)
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
      insertTaskSchema
        .omit({
          id: true,
          userId: true,
          orgId: true,
          created_at: true,
          created_by: true,
          updated_at: true,
          updated_by: true,
        })
        .partial()
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { id } = ctx.req.valid("param");
      const values = ctx.req.valid("json");
      const userFilter = auth.orgId
        ? eq(taskLists.orgId, auth.orgId)
        : eq(taskLists.userId, auth.userId);

      const [existing] = await db
        .select({ id: tasks.id })
        .from(tasks)
        .innerJoin(taskLists, eq(tasks.listId, taskLists.id))
        .where(and(eq(tasks.id, id), userFilter));

      if (!existing) return ctx.json({ error: "Task not found" }, 404);

      const [data] = await db
        .update(tasks)
        .set({ ...values, updated_at: new Date(), updated_by: auth.userId })
        .where(eq(tasks.id, id))
        .returning();

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

      const [existing] = await db
        .select({ id: tasks.id })
        .from(tasks)
        .innerJoin(taskLists, eq(tasks.listId, taskLists.id))
        .where(and(eq(tasks.id, id), userFilter));

      if (!existing) return ctx.json({ error: "Task not found" }, 404);

      const [data] = await db
        .delete(tasks)
        .where(eq(tasks.id, id))
        .returning();

      return ctx.json({ data });
    }
  );

export default app;
