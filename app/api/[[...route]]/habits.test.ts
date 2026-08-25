import { describe, expect, it } from "vitest";

import { computeStreaks, daysBetween, isHabitDueToday } from "./habits";

describe("daysBetween", () => {
  it("returns 0 for the same date", () => {
    expect(daysBetween("2026-08-25", "2026-08-25")).toBe(0);
  });

  it("returns 1 for consecutive days", () => {
    expect(daysBetween("2026-08-24", "2026-08-25")).toBe(1);
  });

  it("returns a negative number when earlier is after later", () => {
    expect(daysBetween("2026-08-25", "2026-08-24")).toBe(-1);
  });
});

describe("computeStreaks", () => {
  it("returns zero streaks for no completed dates", () => {
    expect(computeStreaks([])).toEqual({ current: 0, longest: 0 });
  });

  it("counts a single completion today as a 1-day current and longest streak", () => {
    expect(computeStreaks(["2026-08-25"], "2026-08-25")).toEqual({
      current: 1,
      longest: 1,
    });
  });

  it("still counts as current when the most recent completion was yesterday", () => {
    expect(computeStreaks(["2026-08-24"], "2026-08-25")).toEqual({
      current: 1,
      longest: 1,
    });
  });

  it("does not count as current when the most recent completion was 2+ days ago", () => {
    expect(computeStreaks(["2026-08-23"], "2026-08-25")).toEqual({
      current: 0,
      longest: 1,
    });
  });

  it("counts a consecutive run ending today as both current and longest", () => {
    const dates = ["2026-08-23", "2026-08-24", "2026-08-25"];
    expect(computeStreaks(dates, "2026-08-25")).toEqual({
      current: 3,
      longest: 3,
    });
  });

  it("reports longest without current when the streak doesn't reach today", () => {
    const dates = ["2026-08-01", "2026-08-02", "2026-08-03"];
    expect(computeStreaks(dates, "2026-08-25")).toEqual({
      current: 0,
      longest: 3,
    });
  });

  it("distinguishes a longer historical run from a shorter trailing streak", () => {
    // A 5-day run in early August, then a gap, then a 2-day run ending today.
    const dates = [
      "2026-08-01",
      "2026-08-02",
      "2026-08-03",
      "2026-08-04",
      "2026-08-05",
      "2026-08-24",
      "2026-08-25",
    ];
    expect(computeStreaks(dates, "2026-08-25")).toEqual({
      current: 2,
      longest: 5,
    });
  });
});

describe("isHabitDueToday", () => {
  it("is always due when targetDays is null (every day)", () => {
    expect(isHabitDueToday(null, new Date(2026, 7, 24))).toBe(true);
    expect(isHabitDueToday(null, new Date(2026, 7, 30))).toBe(true);
  });

  it("is due on a day whose bit is set in the bitmask", () => {
    const mondayOnly = 1 << 0; // bit 0 = Monday
    const monday = new Date(2026, 7, 24); // confirmed Monday
    expect(isHabitDueToday(mondayOnly, monday)).toBe(true);
  });

  it("is not due on a day whose bit is not set in the bitmask", () => {
    const mondayOnly = 1 << 0;
    const tuesday = new Date(2026, 7, 25); // confirmed Tuesday
    expect(isHabitDueToday(mondayOnly, tuesday)).toBe(false);
  });

  it("handles Sunday correctly (bit 6, week starts Monday)", () => {
    const sundayOnly = 1 << 6;
    const sunday = new Date(2026, 7, 30); // confirmed Sunday
    const monday = new Date(2026, 7, 24);
    expect(isHabitDueToday(sundayOnly, sunday)).toBe(true);
    expect(isHabitDueToday(sundayOnly, monday)).toBe(false);
  });

  it("supports a multi-day mask (e.g. Mon/Wed/Fri)", () => {
    const monWedFri = (1 << 0) | (1 << 2) | (1 << 4);
    const monday = new Date(2026, 7, 24);
    const wednesday = new Date(2026, 7, 26);
    const tuesday = new Date(2026, 7, 25);
    expect(isHabitDueToday(monWedFri, monday)).toBe(true);
    expect(isHabitDueToday(monWedFri, wednesday)).toBe(true);
    expect(isHabitDueToday(monWedFri, tuesday)).toBe(false);
  });
});
