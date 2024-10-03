import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { differenceInDays, parse, subDays } from "date-fns";
import { Hono } from "hono";
import { z } from "zod";

import { calculatePercentageChange, fillMissingDays } from "@/lib/utils";

import { fetchFinancialData } from "../utils/fetch-financial-data";
import { fetchSpendingByCategory } from "../utils/fetch-spending-by-category";
import { fetchSpendingByDays } from "../utils/fetch-spending-by-days";

const app = new Hono().get(
  "/finance",
  clerkMiddleware(),
  zValidator(
    "query",
    z.object({
      from: z.string().optional(),
      to: z.string().optional(),
      accountId: z.string().optional(),
    })
  ),
  async (ctx) => {
    const auth = getAuth(ctx);

    if (!auth?.userId) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const { from, to, accountId } = ctx.req.valid("query");

    const defaultTo = new Date();
    const defaultFrom = subDays(defaultTo, 30);

    const startDate = from
      ? parse(from, "yyyy-MM-dd", new Date())
      : defaultFrom;
    console.log("startDate:", startDate);

    const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo;
    console.log("endDate:", endDate);

    const periodLength = differenceInDays(endDate, startDate) + 1;
    console.log("periodLength:", periodLength);
    const lastPeriodStart = subDays(startDate, periodLength);
    console.log("lastPeriodStart:", lastPeriodStart);
    const lastPeriodEnd = subDays(endDate, periodLength);
    console.log("lastPeriodEnd:", lastPeriodEnd);

    const currentPeriod = await fetchFinancialData(
      auth.userId,
      startDate,
      endDate,
      auth.orgId,
      accountId
    );

    const lastPeriod = await fetchFinancialData(
      auth.userId,
      lastPeriodStart,
      lastPeriodEnd,
      auth.orgId,
      accountId
    );

    console.log("currentPeriod.income", currentPeriod.income);
    console.log("currentPeriod.expenses", currentPeriod.expenses);
    console.log("currentPeriod.remaining", currentPeriod.remaining);

    console.log("lastPeriod.income", lastPeriod.income);
    console.log("lastPeriod.expenses", lastPeriod.expenses);
    console.log("lastPeriod.remaining", lastPeriod.remaining);

    const incomeChange = calculatePercentageChange(
      currentPeriod.income,
      lastPeriod.income
    );

    const expensesChange = calculatePercentageChange(
      currentPeriod.expenses,
      lastPeriod.expenses
    );

    const remainingChange = calculatePercentageChange(
      currentPeriod.remaining,
      lastPeriod.remaining
    );

    const finalCategories = await fetchSpendingByCategory(
      auth.userId,
      startDate,
      endDate,
      auth.orgId,
      accountId
    );

    const activeDays = await fetchSpendingByDays(
      auth.userId,
      startDate,
      endDate,
      auth.orgId,
      accountId
    );

    const days = fillMissingDays(activeDays, startDate, endDate);

    return ctx.json({
      data: {
        remainingAmount: currentPeriod.remaining,
        remainingChange,
        incomeAmount: currentPeriod.income,
        incomeChange,
        expensesAmount: currentPeriod.expenses,
        expensesChange,
        categories: finalCategories,
        days,
      },
    });
  }
);

export default app;
