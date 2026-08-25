import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { insertUtilityReadingSchema, utilityReadings } from "@/db/schema";
import { getAuth } from "@/lib/local-auth";

// ── anomaly detection ────────────────────────────────────────────────────────
// Flags a reading whose usage deviates >30% from the average of the prior
// 3 readings of the same utility type (needs at least 2 prior readings).

const ANOMALY_THRESHOLD = 0.3;
const TRAILING_WINDOW = 3;

export function withAnomalyFlags<
  T extends {
    id: string;
    utilityType: string;
    periodStart: Date;
    usage: number;
  },
>(readings: T[]) {
  const byType = new Map<string, T[]>();
  for (const r of readings) {
    const arr = byType.get(r.utilityType) ?? [];
    arr.push(r);
    byType.set(r.utilityType, arr);
  }

  const flags = new Map<
    string,
    { isAnomaly: boolean; averageUsage: number | null }
  >();

  for (const arr of byType.values()) {
    const sorted = [...arr].sort(
      (a, b) => a.periodStart.getTime() - b.periodStart.getTime()
    );
    for (let i = 0; i < sorted.length; i++) {
      const prior = sorted.slice(Math.max(0, i - TRAILING_WINDOW), i);
      if (prior.length < 2) {
        flags.set(sorted[i].id, { isAnomaly: false, averageUsage: null });
        continue;
      }
      const avg = prior.reduce((sum, p) => sum + p.usage, 0) / prior.length;
      const deviation = avg === 0 ? 0 : Math.abs(sorted[i].usage - avg) / avg;
      flags.set(sorted[i].id, {
        isAnomaly: deviation > ANOMALY_THRESHOLD,
        averageUsage: avg,
      });
    }
  }

  return readings.map((r) => ({
    ...r,
    ...(flags.get(r.id) ?? { isAnomaly: false, averageUsage: null }),
  }));
}

const app = new Hono()
  // GET /api/utility-readings — list, with anomaly flags computed per type
  .get("/", async (ctx) => {
    const auth = getAuth(ctx);
    if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

    const rows = await db
      .select()
      .from(utilityReadings)
      .where(eq(utilityReadings.userId, auth.userId));

    const data = withAnomalyFlags(rows).sort(
      (a, b) => b.periodStart.getTime() - a.periodStart.getTime()
    );

    return ctx.json({ data });
  })

  // POST /api/utility-readings — create
  .post(
    "/",
    zValidator(
      "json",
      insertUtilityReadingSchema.omit({
        id: true,
        userId: true,
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
        .insert(utilityReadings)
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

  // PATCH /api/utility-readings/:id — update
  .patch(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    zValidator(
      "json",
      insertUtilityReadingSchema
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
      const userFilter = eq(utilityReadings.userId, auth.userId);

      const [existing] = await db
        .select({ id: utilityReadings.id })
        .from(utilityReadings)
        .where(and(eq(utilityReadings.id, id), userFilter));

      if (!existing) return ctx.json({ error: "Reading not found" }, 404);

      const [data] = await db
        .update(utilityReadings)
        .set({ ...values, updated_at: new Date(), updated_by: auth.userId })
        .where(eq(utilityReadings.id, id))
        .returning();

      return ctx.json({ data });
    }
  )

  // DELETE /api/utility-readings/:id — delete
  .delete(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { id } = ctx.req.valid("param");
      const userFilter = eq(utilityReadings.userId, auth.userId);

      const [existing] = await db
        .select({ id: utilityReadings.id })
        .from(utilityReadings)
        .where(and(eq(utilityReadings.id, id), userFilter));

      if (!existing) return ctx.json({ error: "Reading not found" }, 404);

      const [data] = await db
        .delete(utilityReadings)
        .where(eq(utilityReadings.id, id))
        .returning();

      return ctx.json({ data });
    }
  );

export default app;
