import { describe, expect, it } from "vitest";

import { getNextMaintenanceDueDate } from "./maintenance-tasks";

// date-fns' add*() helpers operate on local time, so dates here are built
// with the local-time constructor (not UTC ISO strings) to keep these
// assertions correct regardless of the environment's timezone.

describe("getNextMaintenanceDueDate", () => {
  const from = new Date(2026, 0, 15); // Jan 15, 2026

  it("advances by one month for monthly frequency", () => {
    expect(getNextMaintenanceDueDate(from, "monthly", null)).toEqual(
      new Date(2026, 1, 15)
    );
  });

  it("advances by three months for quarterly frequency", () => {
    expect(getNextMaintenanceDueDate(from, "quarterly", null)).toEqual(
      new Date(2026, 3, 15)
    );
  });

  it("advances by six months for biannual frequency", () => {
    expect(getNextMaintenanceDueDate(from, "biannual", null)).toEqual(
      new Date(2026, 6, 15)
    );
  });

  it("advances by one year for annual frequency", () => {
    expect(getNextMaintenanceDueDate(from, "annual", null)).toEqual(
      new Date(2027, 0, 15)
    );
  });

  it("advances by the configured number of days for custom_days frequency", () => {
    expect(getNextMaintenanceDueDate(from, "custom_days", 90)).toEqual(
      new Date(2026, 3, 15)
    );
  });

  it("returns null for custom_days with no interval configured", () => {
    expect(getNextMaintenanceDueDate(from, "custom_days", null)).toBeNull();
  });

  it("returns null for 'none' frequency", () => {
    expect(getNextMaintenanceDueDate(from, "none", null)).toBeNull();
  });

  it("returns null for an unrecognized frequency", () => {
    expect(getNextMaintenanceDueDate(from, "biweekly", null)).toBeNull();
  });
});
