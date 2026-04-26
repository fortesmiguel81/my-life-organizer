import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { and, eq, gte, inArray, lte } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { habitLogs, habits, insertHabitSchema } from "@/db/schema";

// ── helpers ──────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function daysBetween(earlier: string, later: string) {
  return Math.round(
    (new Date(later).getTime() - new Date(earlier).getTime()) / 86_400_000
  );
}

function computeStreaks(completedDatesAsc: string[]) {
  if (!completedDatesAsc.length) return { current: 0, longest: 0 };

  const today = todayStr();
  const desc = [...completedDatesAsc].reverse();
  const mostRecent = desc[0];

  const gapToToday = daysBetween(mostRecent, today);
  let inCurrent = gapToToday <= 1;
  let current = inCurrent ? 1 : 0;
  let longest = 1;
  let run = 1;

  for (let i = 1; i < desc.length; i++) {
    const diff = daysBetween(desc[i], desc[i - 1]);
    if (diff === 1) {
      run++;
      if (inCurrent) current = run;
      if (run > longest) longest = run;
    } else {
      inCurrent = false;
      if (run > longest) longest = run;
      run = 1;
    }
  }

  return { current, longest };
}

function isHabitDueToday(targetDays: number | null) {
  if (targetDays === null) return true;
  const dayOfWeek = (new Date().getDay() + 6) % 7; // Mon=0 … Sun=6
  return (targetDays & (1 << dayOfWeek)) !== 0;
}

// ── router ────────────────────────────────────────────────────────────────────

const app = new Hono()
  // GET /api/habits — list with today's log status + current streak
  .get("/", clerkMiddleware(), async (ctx) => {
    const auth = getAuth(ctx);
    if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

    const userFilter = eq(habits.userId, auth.userId);

    const today = todayStr();

    const [habitRows, todayLogs, recentLogs] = await Promise.all([
      db.select().from(habits).where(userFilter).orderBy(habits.created_at),
      db
        .select()
        .from(habitLogs)
        .where(and(eq(habitLogs.date, today))),
      db
        .select({ habitId: habitLogs.habitId, date: habitLogs.date })
        .from(habitLogs)
        .where(
          and(
            eq(habitLogs.completed, true),
            gte(habitLogs.date, (() => {
              const d = new Date();
              d.setDate(d.getDate() - 366);
              return d.toISOString().split("T")[0];
            })())
          )
        )
        .orderBy(habitLogs.date),
    ]);

    const todayMap = new Map(todayLogs.map((l) => [l.habitId, l]));

    const logsByHabit = new Map<string, string[]>();
    for (const l of recentLogs) {
      const arr = logsByHabit.get(l.habitId) ?? [];
      arr.push(l.date);
      logsByHabit.set(l.habitId, arr);
    }

    const data = habitRows.map((h) => {
      const todayLog = todayMap.get(h.id);
      const { current } = computeStreaks(logsByHabit.get(h.id) ?? []);
      return {
        ...h,
        todayCompleted: todayLog?.completed ?? false,
        todayLogId: todayLog?.id ?? null,
        currentStreak: current,
        dueToday: isHabitDueToday(h.targetDays),
      };
    });

    return ctx.json({ data });
  })

  // POST /api/habits — create
  .post(
    "/",
    clerkMiddleware(),
    zValidator(
      "json",
      insertHabitSchema.omit({
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
        .insert(habits)
        .values({
          id: createId(),
          ...values,
          userId: auth.userId,
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

  // PATCH /api/habits/:id — update
  .patch(
    "/:id",
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string() })),
    zValidator(
      "json",
      insertHabitSchema
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
        ? eq(habits.orgId, auth.orgId)
        : eq(habits.userId, auth.userId);

      const [existing] = await db
        .select({ id: habits.id })
        .from(habits)
        .where(and(eq(habits.id, id), userFilter));

      if (!existing) return ctx.json({ error: "Habit not found" }, 404);

      const [data] = await db
        .update(habits)
        .set({ ...values, updated_at: new Date(), updated_by: auth.userId })
        .where(eq(habits.id, id))
        .returning();

      return ctx.json({ data });
    }
  )

  // DELETE /api/habits/:id — delete (logs cascade)
  .delete(
    "/:id",
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string() })),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { id } = ctx.req.valid("param");
      const userFilter = auth.orgId
        ? eq(habits.orgId, auth.orgId)
        : eq(habits.userId, auth.userId);

      const [existing] = await db
        .select({ id: habits.id })
        .from(habits)
        .where(and(eq(habits.id, id), userFilter));

      if (!existing) return ctx.json({ error: "Habit not found" }, 404);

      const [data] = await db
        .delete(habits)
        .where(eq(habits.id, id))
        .returning();

      return ctx.json({ data });
    }
  )

  // POST /api/habits/:id/log — upsert today's log (toggle)
  .post(
    "/:id/log",
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string() })),
    zValidator(
      "json",
      z.object({
        date: z.string(), // "YYYY-MM-DD"
        completed: z.boolean(),
        note: z.string().optional().nullable(),
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { id } = ctx.req.valid("param");
      const { date, completed, note } = ctx.req.valid("json");

      const [data] = await db
        .insert(habitLogs)
        .values({
          id: createId(),
          habitId: id,
          date,
          completed,
          note: note ?? null,
          userId: auth.userId,
          created_at: new Date(),
        })
        .onConflictDoUpdate({
          target: [habitLogs.habitId, habitLogs.date],
          set: { completed, note: note ?? null },
        })
        .returning();

      return ctx.json({ data });
    }
  )

  // GET /api/habits/:id/stats — streak + completion stats
  .get(
    "/:id/stats",
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string() })),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { id } = ctx.req.valid("param");

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

      const allCompleted = await db
        .select({ date: habitLogs.date })
        .from(habitLogs)
        .where(and(eq(habitLogs.habitId, id), eq(habitLogs.completed, true)))
        .orderBy(habitLogs.date);

      const completedDates = allCompleted.map((l) => l.date);
      const { current, longest } = computeStreaks(completedDates);

      const totalCompleted = completedDates.length;
      const completed30d = completedDates.filter(
        (d) => d >= thirtyDaysAgoStr
      ).length;

      return ctx.json({
        data: {
          currentStreak: current,
          longestStreak: longest,
          completionRate30d: Math.round((completed30d / 30) * 100),
          totalCompleted,
        },
      });
    }
  )

  // GET /api/habits/:id/logs?from=&to= — raw log history for heatmap
  .get(
    "/:id/logs",
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string() })),
    zValidator(
      "query",
      z.object({ from: z.string().optional(), to: z.string().optional() })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { id } = ctx.req.valid("param");
      const { from, to } = ctx.req.valid("query");

      const conditions: Parameters<typeof and>[0][] = [
        eq(habitLogs.habitId, id),
      ];
      if (from) conditions.push(gte(habitLogs.date, from));
      if (to) conditions.push(lte(habitLogs.date, to));

      const data = await db
        .select()
        .from(habitLogs)
        .where(and(...conditions))
        .orderBy(habitLogs.date);

      return ctx.json({ data });
    }
  );

export default app;
