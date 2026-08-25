import { describe, expect, it } from "vitest";

import { DEFAULT_LAYOUT, mergeLayout } from "./constants";

describe("mergeLayout", () => {
  it("returns the default layout when nothing is saved", () => {
    expect(mergeLayout(null)).toEqual(DEFAULT_LAYOUT);
    expect(mergeLayout(undefined)).toEqual(DEFAULT_LAYOUT);
  });

  it("uses the saved order for a section that has one", () => {
    const result = mergeLayout({ today: ["calendar", "habits", "tasks"] });
    expect(result.today).toEqual(["calendar", "habits", "tasks"]);
  });

  it("falls back to the default order for a section with no saved order", () => {
    const result = mergeLayout({ today: ["tasks", "habits", "calendar"] });
    expect(result.home).toEqual(DEFAULT_LAYOUT.home);
  });

  it("drops ids that no longer exist in that section's defaults", () => {
    const result = mergeLayout({
      today: ["habits", "ghost-widget", "tasks", "calendar"],
    });
    expect(result.today).toEqual(["habits", "tasks", "calendar"]);
  });

  it("appends default ids missing from a saved order", () => {
    // "calendar" was added to the app after this profile last saved a layout.
    const result = mergeLayout({ today: ["tasks", "habits"] });
    expect(result.today).toEqual(["tasks", "habits", "calendar"]);
  });

  it("never drops or duplicates a widget across a reorder-and-merge round trip", () => {
    const reordered = { home: [...DEFAULT_LAYOUT.home].reverse() };
    const result = mergeLayout(reordered);
    expect(result.home).toHaveLength(DEFAULT_LAYOUT.home.length);
    expect(new Set(result.home)).toEqual(new Set(DEFAULT_LAYOUT.home));
  });
});
