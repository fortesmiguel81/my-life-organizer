import {
  and,
  asc,
  eq,
  gte,
  inArray,
  isNotNull,
  lt,
  ne,
  sql,
} from "drizzle-orm";
import { Hono } from "hono";

import { db } from "@/db/drizzle";
import {
  accounts,
  assets,
  budgets,
  documents,
  events,
  habitLogs,
  habits,
  maintenanceTasks,
  shoppingItems,
  shoppingLists,
  tasks,
  utilityReadings,
  vendorQuotes,
  vendors,
} from "@/db/schema";
import { getAuth } from "@/lib/local-auth";
import { fillMissingDays } from "@/lib/utils";

import { fetchFinancialData } from "../utils/fetch-financial-data";
import { fetchSpendingByDays } from "../utils/fetch-spending-by-days";
import { computeStreaks, isHabitDueToday } from "./habits";
import { withAnomalyFlags } from "./utility-readings";

const DAY_MS = 86_400_000;

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function daysUntil(date: Date, from: Date) {
  return Math.round(
    (startOfDay(date).getTime() - startOfDay(from).getTime()) / DAY_MS
  );
}

async function habitsWidget(userId: string, now: Date) {
  const today = now.toISOString().split("T")[0];
  const yearAgo = new Date(now);
  yearAgo.setDate(yearAgo.getDate() - 366);

  const [habitRows, todayLogs, recentLogs] = await Promise.all([
    db.select().from(habits).where(eq(habits.userId, userId)),
    db
      .select({ habitId: habitLogs.habitId, completed: habitLogs.completed })
      .from(habitLogs)
      .where(and(eq(habitLogs.userId, userId), eq(habitLogs.date, today))),
    db
      .select({ habitId: habitLogs.habitId, date: habitLogs.date })
      .from(habitLogs)
      .where(
        and(
          eq(habitLogs.userId, userId),
          eq(habitLogs.completed, true),
          gte(habitLogs.date, yearAgo.toISOString().split("T")[0])
        )
      )
      .orderBy(asc(habitLogs.date)),
  ]);

  const todayCompletedSet = new Set(
    todayLogs.filter((l) => l.completed).map((l) => l.habitId)
  );

  const logsByHabit = new Map<string, string[]>();
  for (const l of recentLogs) {
    const arr = logsByHabit.get(l.habitId) ?? [];
    arr.push(l.date);
    logsByHabit.set(l.habitId, arr);
  }

  const dueToday = habitRows.filter((h) => isHabitDueToday(h.targetDays, now));
  const doneToday = dueToday.filter((h) => todayCompletedSet.has(h.id)).length;

  let bestStreak: { title: string; count: number } | null = null;
  for (const h of habitRows) {
    const { current } = computeStreaks(logsByHabit.get(h.id) ?? []);
    if (current > 0 && (!bestStreak || current > bestStreak.count)) {
      bestStreak = { title: h.title, count: current };
    }
  }

  return {
    doneToday,
    dueToday: dueToday.length,
    dueTodayHabits: dueToday.map((h) => ({
      id: h.id,
      done: todayCompletedSet.has(h.id),
    })),
    bestStreak,
  };
}

async function tasksWidget(userId: string, now: Date) {
  const today = startOfDay(now);
  const tomorrow = new Date(today.getTime() + DAY_MS);

  const openTasks = await db
    .select({ id: tasks.id, title: tasks.title, dueDate: tasks.dueDate })
    .from(tasks)
    .where(and(eq(tasks.userId, userId), ne(tasks.status, "done")));

  const withDueDate = openTasks.filter(
    (t): t is typeof t & { dueDate: Date } => t.dueDate !== null
  );

  const overdue = withDueDate.filter((t) => t.dueDate < today);
  const dueTodayList = withDueDate.filter(
    (t) => t.dueDate >= today && t.dueDate < tomorrow
  );

  const upcoming = [...withDueDate]
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 2)
    .map((t) => ({
      id: t.id,
      title: t.title,
      dueDate: t.dueDate,
      overdue: t.dueDate < today,
    }));

  return {
    overdueCount: overdue.length,
    dueTodayCount: dueTodayList.length,
    upcoming,
  };
}

async function calendarWidget(userId: string, now: Date) {
  const rows = await db
    .select({
      id: events.id,
      title: events.title,
      startDate: events.startDate,
      allDay: events.allDay,
    })
    .from(events)
    .where(and(eq(events.userId, userId), gte(events.startDate, now)))
    .orderBy(asc(events.startDate))
    .limit(3);

  const fourteenDaysOut = new Date(now.getTime() + 14 * DAY_MS);
  const [{ count: upcomingCount }] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(events)
    .where(
      and(
        eq(events.userId, userId),
        gte(events.startDate, now),
        lt(events.startDate, fourteenDaysOut)
      )
    );

  return { upcoming: rows, upcomingCount };
}

async function financeWidget(userId: string, now: Date) {
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const fourteenDaysAgo = new Date(startOfDay(now).getTime() - 13 * DAY_MS);

  const [balanceRow, monthData, monthlyBudgets, dailySpending] =
    await Promise.all([
      db
        .select({
          total: sql<number>`COALESCE(SUM(${accounts.balance}), 0)`.mapWith(
            Number
          ),
        })
        .from(accounts)
        .where(eq(accounts.userId, userId)),
      fetchFinancialData(userId, startOfMonth, now),
      db
        .select({
          total: sql<number>`COALESCE(SUM(${budgets.amount}), 0)`.mapWith(
            Number
          ),
        })
        .from(budgets)
        .where(and(eq(budgets.userId, userId), eq(budgets.type, "monthly"))),
      fetchSpendingByDays(userId, fourteenDaysAgo, now),
    ]);

  const filled = fillMissingDays(dailySpending, fourteenDaysAgo, now);
  let running = 0;
  const sparkline = filled.map((d) => {
    running += d.income - d.expenses;
    return running;
  });

  return {
    totalBalance: balanceRow[0]?.total ?? 0,
    monthIncome: monthData.income,
    monthExpenses: Math.abs(monthData.expenses),
    monthNet: monthData.remaining,
    budgetTotal: monthlyBudgets[0]?.total ?? 0,
    budgetSpent: Math.abs(monthData.expenses),
    sparkline,
  };
}

async function maintenanceWidget(userId: string, now: Date) {
  const rows = await db
    .select({
      id: maintenanceTasks.id,
      title: maintenanceTasks.title,
      dueDate: maintenanceTasks.dueDate,
    })
    .from(maintenanceTasks)
    .where(
      and(
        eq(maintenanceTasks.userId, userId),
        isNotNull(maintenanceTasks.dueDate)
      )
    );

  const withDue = rows.filter(
    (r): r is typeof r & { dueDate: Date } => r.dueDate !== null
  );
  const overdue = withDue.filter((r) => r.dueDate < now);

  const items = [...withDue]
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 2)
    .map((r) => ({
      id: r.id,
      title: r.title,
      dueDate: r.dueDate,
      overdue: r.dueDate < now,
    }));

  return { overdueCount: overdue.length, openCount: withDue.length, items };
}

async function assetsWidget(userId: string, now: Date) {
  const rows = await db
    .select({
      id: assets.id,
      name: assets.name,
      warrantyExpiration: assets.warrantyExpiration,
    })
    .from(assets)
    .where(
      and(eq(assets.userId, userId), isNotNull(assets.warrantyExpiration))
    );

  const withExpiry = rows.filter(
    (r): r is typeof r & { warrantyExpiration: Date } =>
      r.warrantyExpiration !== null
  );
  const upcoming = withExpiry
    .filter((r) => r.warrantyExpiration >= now)
    .sort(
      (a, b) => a.warrantyExpiration.getTime() - b.warrantyExpiration.getTime()
    );

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)`.mapWith(Number) })
    .from(assets)
    .where(eq(assets.userId, userId));

  const nearest = upcoming[0]
    ? {
        id: upcoming[0].id,
        name: upcoming[0].name,
        warrantyExpiration: upcoming[0].warrantyExpiration,
        daysLeft: daysUntil(upcoming[0].warrantyExpiration, now),
      }
    : null;

  return { nearest, totalCount: total };
}

async function utilitiesWidget(userId: string) {
  const rows = await db
    .select()
    .from(utilityReadings)
    .where(eq(utilityReadings.userId, userId));

  if (!rows.length) return { latest: null, trend: [] };

  const flagged = withAnomalyFlags(rows);
  const latest = [...flagged].sort(
    (a, b) => b.periodStart.getTime() - a.periodStart.getTime()
  )[0];

  const trend = flagged
    .filter((r) => r.utilityType === latest.utilityType)
    .sort((a, b) => a.periodStart.getTime() - b.periodStart.getTime())
    .slice(-6)
    .map((r) => r.usage);

  return {
    latest: {
      id: latest.id,
      utilityType: latest.utilityType,
      usage: latest.usage,
      unit: latest.unit,
      isAnomaly: latest.isAnomaly,
      averageUsage: latest.averageUsage,
      periodStart: latest.periodStart,
      periodEnd: latest.periodEnd,
    },
    trend,
  };
}

async function vendorsWidget(userId: string) {
  const [{ total }] = await db
    .select({ total: sql<number>`count(*)`.mapWith(Number) })
    .from(vendors)
    .where(eq(vendors.userId, userId));

  const [pending] = await db
    .select({
      id: vendorQuotes.id,
      description: vendorQuotes.description,
      vendorName: vendors.name,
    })
    .from(vendorQuotes)
    .innerJoin(vendors, eq(vendorQuotes.vendorId, vendors.id))
    .where(
      and(eq(vendorQuotes.userId, userId), eq(vendorQuotes.status, "pending"))
    )
    .orderBy(asc(vendorQuotes.created_at))
    .limit(1);

  const [{ pendingCount }] = await db
    .select({ pendingCount: sql<number>`count(*)`.mapWith(Number) })
    .from(vendorQuotes)
    .where(
      and(eq(vendorQuotes.userId, userId), eq(vendorQuotes.status, "pending"))
    );

  return { total, pendingCount, pendingQuote: pending ?? null };
}

async function shoppingWidget(userId: string) {
  const lists = await db
    .select({ id: shoppingLists.id, name: shoppingLists.name })
    .from(shoppingLists)
    .where(eq(shoppingLists.userId, userId));

  if (!lists.length)
    return { itemsLeft: 0, listCount: 0, estimatedTotal: 0, lists: [] };

  const listIds = lists.map((l) => l.id);
  const items = await db
    .select({
      listId: shoppingItems.listId,
      checked: shoppingItems.checked,
      estimatedPrice: shoppingItems.estimatedPrice,
    })
    .from(shoppingItems)
    .where(
      and(
        eq(shoppingItems.userId, userId),
        inArray(shoppingItems.listId, listIds)
      )
    );

  const unchecked = items.filter((i) => !i.checked);
  const estimatedTotal = unchecked.reduce(
    (sum, i) => sum + (i.estimatedPrice ?? 0),
    0
  );

  const countByList = new Map<string, number>();
  for (const i of unchecked) {
    countByList.set(i.listId, (countByList.get(i.listId) ?? 0) + 1);
  }

  return {
    itemsLeft: unchecked.length,
    listCount: lists.length,
    estimatedTotal,
    lists: lists
      .map((l) => ({ name: l.name, count: countByList.get(l.id) ?? 0 }))
      .filter((l) => l.count > 0),
  };
}

async function documentsWidget(userId: string, now: Date) {
  const rows = await db
    .select({
      id: documents.id,
      name: documents.name,
      expiryDate: documents.expiryDate,
    })
    .from(documents)
    .where(and(eq(documents.userId, userId), isNotNull(documents.expiryDate)));

  const withExpiry = rows.filter(
    (r): r is typeof r & { expiryDate: Date } => r.expiryDate !== null
  );
  const upcoming = withExpiry
    .filter((r) => r.expiryDate >= now)
    .sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime());

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)`.mapWith(Number) })
    .from(documents)
    .where(eq(documents.userId, userId));

  const nearest = upcoming[0]
    ? {
        id: upcoming[0].id,
        name: upcoming[0].name,
        expiryDate: upcoming[0].expiryDate,
        daysLeft: daysUntil(upcoming[0].expiryDate, now),
      }
    : null;

  return { nearest, totalCount: total };
}

const app = new Hono().get("/", async (ctx) => {
  const auth = getAuth(ctx);
  if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

  const userId = auth.userId;
  const now = new Date();

  const [
    habitsData,
    tasksData,
    calendarData,
    financeData,
    maintenanceData,
    assetsData,
    utilitiesData,
    vendorsData,
    shoppingData,
    documentsData,
  ] = await Promise.all([
    habitsWidget(userId, now),
    tasksWidget(userId, now),
    calendarWidget(userId, now),
    financeWidget(userId, now),
    maintenanceWidget(userId, now),
    assetsWidget(userId, now),
    utilitiesWidget(userId),
    vendorsWidget(userId),
    shoppingWidget(userId),
    documentsWidget(userId, now),
  ]);

  return ctx.json({
    data: {
      habits: habitsData,
      tasks: tasksData,
      calendar: calendarData,
      finance: financeData,
      maintenance: maintenanceData,
      assets: assetsData,
      utilities: utilitiesData,
      vendors: vendorsData,
      shopping: shoppingData,
      documents: documentsData,
    },
  });
});

export default app;
