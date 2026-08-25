import { describe, expect, it } from "vitest";

import { getNextDueDate } from "./transactions";

// date-fns' add*() helpers operate on local time, so dates here are built
// with the local-time constructor (not UTC ISO strings) to keep these
// assertions correct regardless of the environment's timezone.

describe("getNextDueDate", () => {
  const from = new Date(2026, 0, 15); // Jan 15, 2026

  it("advances by one day for daily recurrence", () => {
    expect(getNextDueDate(from, "daily")).toEqual(new Date(2026, 0, 16));
  });

  it("advances by one week for weekly recurrence", () => {
    expect(getNextDueDate(from, "weekly")).toEqual(new Date(2026, 0, 22));
  });

  it("advances by two weeks for biweekly recurrence", () => {
    expect(getNextDueDate(from, "biweekly")).toEqual(new Date(2026, 0, 29));
  });

  it("advances by one month for monthly recurrence", () => {
    expect(getNextDueDate(from, "monthly")).toEqual(new Date(2026, 1, 15));
  });

  it("advances by one year for yearly recurrence", () => {
    expect(getNextDueDate(from, "yearly")).toEqual(new Date(2027, 0, 15));
  });

  it("returns undefined for 'none' recurrence", () => {
    expect(getNextDueDate(from, "none")).toBeUndefined();
  });

  it("returns undefined for an unrecognized recurrence value", () => {
    expect(getNextDueDate(from, "fortnightly")).toBeUndefined();
  });

  it("handles month-end overflow correctly (Jan 31 -> Feb 28)", () => {
    const jan31 = new Date(2026, 0, 31);
    // date-fns addMonths clamps to the last valid day of the target month
    expect(getNextDueDate(jan31, "monthly")).toEqual(new Date(2026, 1, 28));
  });
});
