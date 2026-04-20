import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { and, eq, isNull } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { insertTaskSchema, taskLists, tasks } from "@/db/schema";

const patchSchema = insertTaskSchema.omit({
  id: true,
  userId: true,
  orgId: true,
  created_at: true,
  created_by: true,
  updated_at: true,
  updated_by: true,
}).partial();

const app = new Hono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        listId: z.string().optional(),
        status: z.enum(["todo", "in_progress", "done"]).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        assignedTo: z.string().optional(),
      })
    ),
    clerkMiddleware(),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { listId, status, priority, assignedTo } = ctx.req.valid("query");

      const userFilter = auth.orgId
        ? eq(taskLists.orgId, auth.orgId)
        : eq(taskLists.userId, auth.userId);

      const conditions: Parameters<typeof and>[0][] = [
        userFilter,
        isNull(tasks.parentId), // top-level tasks only in list view
      ];
      if (listId) conditions.push(eq(tasks.listId, listId));
      if (status) conditions.push(eq(tasks.status, status));
      if (priority) conditions.push(eq(tasks.priority, priority));
      if (assignedTo) conditions.push(eq(tasks.assignedTo, assignedTo));

      const data = await db
        .select({
          id: tasks.id,
          listId: tasks.listId,
          title: tasks.title,
          description: tasks.description,
          status: tasks.status,
          priority: tasks.priority,
          dueDate: tasks.dueDate,
          assignedTo: tasks.assignedTo,
          parentId: tasks.parentId,
          calendarEventId: tasks.calendarEventId,
          created_at: tasks.created_at,
          updated_at: tasks.updated_at,
        })
        .from(tasks)
        .innerJoin(taskLists, eq(tasks.listId, taskLists.id))
        .where(and(...conditions));

      // Fetch subtask counts per parent
      const subtasksMap: Record<string, number> = {};
      const allSubtasks = await db
        .select({ parentId: tasks.parentId })
        .from(tasks)
        .innerJoin(taskLists, eq(tasks.listId, taskLists.id))
        .where(and(userFilter));

      for (const row of allSubtasks) {
        if (row.parentId) {
          subtasksMap[row.parentId] = (subtasksMap[row.parentId] ?? 0) + 1;
        }
      }

      const result = data.map((t) => ({
        ...t,
        subtaskCount: subtasksMap[t.id] ?? 0,
      }));

      return ctx.json({ data: result });
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

      const [task] = await db
        .select()
        .from(tasks)
        .innerJoin(taskLists, eq(tasks.listId, taskLists.id))
        .where(and(eq(tasks.id, id), userFilter));

      if (!task) return ctx.json({ error: "Task not found" }, 404);

      const subtasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.parentId, id));

      return ctx.json({ data: { ...task.tasks, subtasks } });
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
    zValidator("json", patchSchema),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { id } = ctx.req.valid("param");
      const values = ctx.req.valid("json");

      const userFilter = auth.orgId
        ? eq(taskLists.orgId, auth.orgId)
        : eq(taskLists.userId, auth.userId);

      // Verify ownership via the joined list
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
