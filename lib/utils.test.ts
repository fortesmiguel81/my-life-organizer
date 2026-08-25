import { describe, expect, it } from "vitest";

import {
  calculatePercentageChange,
  convertAmountFromMiliunits,
  convertAmountToMiliunits,
  fillMissingDays,
  formatCurrency,
  formatDateRange,
  formatPercentage,
} from "./utils";

describe("convertAmountToMiliunits / convertAmountFromMiliunits", () => {
  it("round-trips a plain dollar amount", () => {
    expect(convertAmountToMiliunits(12.5)).toBe(12500);
    expect(convertAmountFromMiliunits(12500)).toBe(12.5);
  });

  it("rounds fractional cents to the nearest miliunit", () => {
    // 19.999999... * 1000 has floating point noise; must round cleanly
    expect(convertAmountToMiliunits(19.999)).toBe(19999);
  });

  it("handles negative amounts (expenses)", () => {
    expect(convertAmountToMiliunits(-42.75)).toBe(-42750);
    expect(convertAmountFromMiliunits(-42750)).toBe(-42.75);
  });

  it("handles zero", () => {
    expect(convertAmountToMiliunits(0)).toBe(0);
    expect(convertAmountFromMiliunits(0)).toBe(0);
  });
});

describe("formatCurrency", () => {
  it("formats a positive value as USD", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
  });

  it("formats a negative value", () => {
    expect(formatCurrency(-99.9)).toBe("-$99.90");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });
});

describe("formatPercentage", () => {
  it("formats without a prefix by default", () => {
    expect(formatPercentage(25)).toBe("25%");
  });

  it("adds a + prefix for positive values when requested", () => {
    expect(formatPercentage(25, { addPrefix: true })).toBe("+25%");
  });

  it("does not add a + prefix for zero or negative values", () => {
    expect(formatPercentage(0, { addPrefix: true })).toBe("0%");
    expect(formatPercentage(-10, { addPrefix: true })).toBe("-10%");
  });
});

describe("calculatePercentageChange", () => {
  it("computes a normal percentage increase", () => {
    expect(calculatePercentageChange(150, 100)).toBe(50);
  });

  it("computes a normal percentage decrease", () => {
    expect(calculatePercentageChange(50, 100)).toBe(-50);
  });

  it("returns 0 when both current and previous are zero", () => {
    expect(calculatePercentageChange(0, 0)).toBe(0);
  });

  it("returns 100 when previous is zero but current is not (avoids Infinity/NaN)", () => {
    expect(calculatePercentageChange(50, 0)).toBe(100);
  });
});

describe("fillMissingDays", () => {
  it("returns an empty array when there are no active days", () => {
    const start = new Date("2026-01-01");
    const end = new Date("2026-01-03");
    expect(fillMissingDays([], start, end)).toEqual([]);
  });

  it("fills gaps between active days with zeroed entries", () => {
    const start = new Date("2026-01-01T00:00:00");
    const end = new Date("2026-01-03T00:00:00");
    const activeDays = [
      { date: new Date("2026-01-01T00:00:00"), income: 100, expenses: 20 },
      { date: new Date("2026-01-03T00:00:00"), income: 0, expenses: 50 },
    ];

    const result = fillMissingDays(activeDays, start, end);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(activeDays[0]);
    expect(result[1]).toMatchObject({ income: 0, expenses: 0 });
    expect(result[2]).toEqual(activeDays[1]);
  });
});

describe("formatDateRange", () => {
  it("returns an empty string when the range is undefined", () => {
    expect(formatDateRange(undefined)).toBe("");
  });

  it("returns an empty string when from or to is missing", () => {
    expect(formatDateRange({ from: new Date(), to: undefined })).toBe("");
  });

  it("formats a complete range", () => {
    const from = new Date("2026-03-01T00:00:00");
    const to = new Date("2026-03-15T00:00:00");
    expect(formatDateRange({ from, to })).toBe("Mar 01 - Mar 15");
  });
});
