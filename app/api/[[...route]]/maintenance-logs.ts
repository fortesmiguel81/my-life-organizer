import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db/drizzle";
import {
  insertMaintenanceLogSchema,
  maintenanceLogs,
  maintenanceTasks,
} from "@/db/schema";
import { getAuth } from "@/lib/local-auth";

import { getNextMaintenanceDueDate } from "./maintenance-tasks";

const app = new Hono()
  // POST /api/maintenance-logs — log a completion (taskId included in body);
  // advances the parent task's dueDate based on its recurrence frequency.
  .post(
    "/",
    zValidator(
      "json",
      insertMaintenanceLogSchema.omit({
        id: true,
        userId: true,
        created_at: true,
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const values = ctx.req.valid("json");

      const [task] = await db
        .select()
        .from(maintenanceTasks)
        .where(
          and(
            eq(maintenanceTasks.id, values.taskId),
            eq(maintenanceTasks.userId, auth.userId)
          )
        );

      if (!task) return ctx.json({ error: "Maintenance task not found" }, 404);

      const now = new Date();

      const [data] = await db
        .insert(maintenanceLogs)
        .values({
          id: createId(),
          ...values,
          userId: auth.userId,
          created_at: now,
        })
        .returning();

      const nextDueDate = getNextMaintenanceDueDate(
        values.completedDate,
        task.frequency,
        task.customIntervalDays
      );

      await db
        .update(maintenanceTasks)
        .set({
          lastCompletedDate: values.completedDate,
          dueDate: nextDueDate,
          dueNotified: false,
          updated_at: now,
          updated_by: auth.userId,
        })
        .where(eq(maintenanceTasks.id, task.id));

      return ctx.json({ data }, 201);
    }
  )

  // PATCH /api/maintenance-logs/:id — update a log entry
  .patch(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    zValidator(
      "json",
      insertMaintenanceLogSchema
        .omit({
          id: true,
          taskId: true,
          userId: true,
          created_at: true,
        })
        .partial()
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { id } = ctx.req.valid("param");
      const values = ctx.req.valid("json");
      const userFilter = eq(maintenanceLogs.userId, auth.userId);

      const [existing] = await db
        .select({ id: maintenanceLogs.id })
        .from(maintenanceLogs)
        .where(and(eq(maintenanceLogs.id, id), userFilter));

      if (!existing) return ctx.json({ error: "Log entry not found" }, 404);

      const [data] = await db
        .update(maintenanceLogs)
        .set(values)
        .where(eq(maintenanceLogs.id, id))
        .returning();

      return ctx.json({ data });
    }
  )

  // DELETE /api/maintenance-logs/:id — delete a log entry
  .delete(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { id } = ctx.req.valid("param");
      const userFilter = eq(maintenanceLogs.userId, auth.userId);

      const [existing] = await db
        .select({ id: maintenanceLogs.id })
        .from(maintenanceLogs)
        .where(and(eq(maintenanceLogs.id, id), userFilter));

      if (!existing) return ctx.json({ error: "Log entry not found" }, 404);

      const [data] = await db
        .delete(maintenanceLogs)
        .where(eq(maintenanceLogs.id, id))
        .returning();

      return ctx.json({ data });
    }
  );

export default app;
