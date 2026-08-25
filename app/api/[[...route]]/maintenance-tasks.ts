import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { addDays, addMonths, addYears } from "date-fns";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db/drizzle";
import {
  assets,
  insertMaintenanceTaskSchema,
  maintenanceLogs,
  maintenanceTasks,
  vendors,
} from "@/db/schema";
import { getAuth } from "@/lib/local-auth";

// ── helpers ──────────────────────────────────────────────────────────────────

export function getNextMaintenanceDueDate(
  from: Date,
  frequency: string,
  customIntervalDays: number | null
): Date | null {
  switch (frequency) {
    case "monthly":
      return addMonths(from, 1);
    case "quarterly":
      return addMonths(from, 3);
    case "biannual":
      return addMonths(from, 6);
    case "annual":
      return addYears(from, 1);
    case "custom_days":
      return customIntervalDays ? addDays(from, customIntervalDays) : null;
    default:
      return null;
  }
}

const app = new Hono()
  // GET /api/maintenance-tasks — list, with asset/vendor names joined
  .get("/", async (ctx) => {
    const auth = getAuth(ctx);
    if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

    const data = await db
      .select({
        id: maintenanceTasks.id,
        title: maintenanceTasks.title,
        description: maintenanceTasks.description,
        category: maintenanceTasks.category,
        assetId: maintenanceTasks.assetId,
        assetName: assets.name,
        vendorId: maintenanceTasks.vendorId,
        vendorName: vendors.name,
        frequency: maintenanceTasks.frequency,
        customIntervalDays: maintenanceTasks.customIntervalDays,
        dueDate: maintenanceTasks.dueDate,
        dueNotified: maintenanceTasks.dueNotified,
        lastCompletedDate: maintenanceTasks.lastCompletedDate,
        notes: maintenanceTasks.notes,
        userId: maintenanceTasks.userId,
        created_at: maintenanceTasks.created_at,
        updated_at: maintenanceTasks.updated_at,
      })
      .from(maintenanceTasks)
      .leftJoin(assets, eq(maintenanceTasks.assetId, assets.id))
      .leftJoin(vendors, eq(maintenanceTasks.vendorId, vendors.id))
      .where(eq(maintenanceTasks.userId, auth.userId))
      .orderBy(maintenanceTasks.dueDate);

    return ctx.json({ data });
  })

  // GET /api/maintenance-tasks/:id — single task with its completion log history
  .get(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { id } = ctx.req.valid("param");

      const [task] = await db
        .select({
          id: maintenanceTasks.id,
          title: maintenanceTasks.title,
          description: maintenanceTasks.description,
          category: maintenanceTasks.category,
          assetId: maintenanceTasks.assetId,
          assetName: assets.name,
          vendorId: maintenanceTasks.vendorId,
          vendorName: vendors.name,
          frequency: maintenanceTasks.frequency,
          customIntervalDays: maintenanceTasks.customIntervalDays,
          dueDate: maintenanceTasks.dueDate,
          dueNotified: maintenanceTasks.dueNotified,
          lastCompletedDate: maintenanceTasks.lastCompletedDate,
          notes: maintenanceTasks.notes,
          userId: maintenanceTasks.userId,
          created_at: maintenanceTasks.created_at,
          updated_at: maintenanceTasks.updated_at,
        })
        .from(maintenanceTasks)
        .leftJoin(assets, eq(maintenanceTasks.assetId, assets.id))
        .leftJoin(vendors, eq(maintenanceTasks.vendorId, vendors.id))
        .where(
          and(
            eq(maintenanceTasks.id, id),
            eq(maintenanceTasks.userId, auth.userId)
          )
        );

      if (!task) return ctx.json({ error: "Maintenance task not found" }, 404);

      const logs = await db
        .select({
          id: maintenanceLogs.id,
          taskId: maintenanceLogs.taskId,
          completedDate: maintenanceLogs.completedDate,
          vendorId: maintenanceLogs.vendorId,
          vendorName: vendors.name,
          cost: maintenanceLogs.cost,
          notes: maintenanceLogs.notes,
          created_at: maintenanceLogs.created_at,
        })
        .from(maintenanceLogs)
        .leftJoin(vendors, eq(maintenanceLogs.vendorId, vendors.id))
        .where(eq(maintenanceLogs.taskId, id))
        .orderBy(maintenanceLogs.completedDate);

      return ctx.json({ data: { ...task, logs: logs.reverse() } });
    }
  )

  // POST /api/maintenance-tasks — create
  .post(
    "/",
    zValidator(
      "json",
      insertMaintenanceTaskSchema.omit({
        id: true,
        userId: true,
        dueNotified: true,
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
        .insert(maintenanceTasks)
        .values({
          id: createId(),
          ...values,
          userId: auth.userId,
          created_at: now,
          created_by: auth.userId,
          updated_at: now,
          updated_by: auth.userId,
        })
        .returning();

      return ctx.json({ data }, 201);
    }
  )

  // PATCH /api/maintenance-tasks/:id — update
  .patch(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    zValidator(
      "json",
      insertMaintenanceTaskSchema
        .omit({
          id: true,
          userId: true,
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
      const userFilter = eq(maintenanceTasks.userId, auth.userId);

      const [existing] = await db
        .select({ id: maintenanceTasks.id })
        .from(maintenanceTasks)
        .where(and(eq(maintenanceTasks.id, id), userFilter));

      if (!existing)
        return ctx.json({ error: "Maintenance task not found" }, 404);

      // Any due-date edit resets the notification flag so a pushed-out date
      // is re-evaluated for the reminder window.
      const resetNotified = "dueDate" in values;

      const [data] = await db
        .update(maintenanceTasks)
        .set({
          ...values,
          ...(resetNotified ? { dueNotified: false } : {}),
          updated_at: new Date(),
          updated_by: auth.userId,
        })
        .where(eq(maintenanceTasks.id, id))
        .returning();

      return ctx.json({ data });
    }
  )

  // DELETE /api/maintenance-tasks/:id — delete (logs cascade)
  .delete(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { id } = ctx.req.valid("param");
      const userFilter = eq(maintenanceTasks.userId, auth.userId);

      const [existing] = await db
        .select({ id: maintenanceTasks.id })
        .from(maintenanceTasks)
        .where(and(eq(maintenanceTasks.id, id), userFilter));

      if (!existing)
        return ctx.json({ error: "Maintenance task not found" }, 404);

      const [data] = await db
        .delete(maintenanceTasks)
        .where(eq(maintenanceTasks.id, id))
        .returning();

      return ctx.json({ data });
    }
  );

export default app;
