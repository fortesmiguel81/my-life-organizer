import { describe, expect, it } from "vitest";

import { relativeDayLabel } from "./format";

const NOW = new Date(2026, 7, 25); // Aug 25, 2026

describe("relativeDayLabel", () => {
  it("labels today and tomorrow", () => {
    expect(relativeDayLabel(new Date(2026, 7, 25), NOW)).toBe("today");
    expect(relativeDayLabel(new Date(2026, 7, 26), NOW)).toBe("tomorrow");
  });

  it("labels overdue dates", () => {
    expect(relativeDayLabel(new Date(2026, 7, 24), NOW)).toBe("1d overdue");
    expect(relativeDayLabel(new Date(2026, 7, 22), NOW)).toBe("3d overdue");
  });

  it("labels near-future dates in days", () => {
    expect(relativeDayLabel(new Date(2026, 7, 30), NOW)).toBe("in 5d");
    expect(relativeDayLabel(new Date(2026, 7, 31), NOW)).toBe("in 6d");
  });

  it("falls back to a short date beyond a week out", () => {
    expect(relativeDayLabel(new Date(2026, 8, 6), NOW)).toBe("Sep 6");
  });

  it("ignores time-of-day when computing the day difference", () => {
    const lateNow = new Date(2026, 7, 25, 23, 59);
    const earlyTarget = new Date(2026, 7, 26, 0, 1);
    expect(relativeDayLabel(earlyTarget, lateNow)).toBe("tomorrow");
  });

  it("accepts an ISO date string", () => {
    expect(relativeDayLabel("2026-08-25T12:00:00.000Z", NOW)).toBe("today");
  });
});
